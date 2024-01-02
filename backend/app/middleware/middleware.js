'use strict';

const jwt = require('jsonwebtoken');
const _const = require('../config/constant');
const Category = require('../models/category');
const Product = require('../models/product');
const Order = require('../models/order');
const News = require('../models/news');
const ReviewModel = require('../models/review');
const color = require('../models/color');
const User = require('../models/user');

module.exports = {
    // Middleware để kiểm tra tính hợp lệ của token khi người dùng truy cập các tài nguyên
    checkLogin: (req, res, next) => {

    // Lấy giá trị token từ trường 'Authorization' trong header của yêu cầu
    const token = req.header('Authorization');

    
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    try {
        // Thử kiểm tra tính hợp lệ của token bằng cách sử dụng thư viện jsonwebtoken (jwt)
        const verified = jwt.verify(token, _const.JWT_ACCESS_KEY);

        // Nếu token hợp lệ, chuyển điều khiển tới middleware tiếp theo
        next();
    } catch (err) {
        return res.status(400).send('Invalid Token');
    }
},


    getCategory: async (req, res, next) => {

    let category;
    try {
        // Sử dụng Model (ở đây là Category) để tìm kiếm danh mục theo ID từ cơ sở dữ liệu
        category = await Category.findById(req.params.id);  
        if (category == null) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        }
    } catch (err) {
        // Nếu có lỗi trong quá trình truy vấn cơ sở dữ liệu, trả về mã trạng thái 500 và thông báo lỗi
        return res.status(500).json({ message: err.message });
    }
    // Nếu không có lỗi, lưu thông tin danh mục vào đối tượng phản hồi (res) để sử dụng ở middleware tiếp theo hoặc trong định tuyến
    res.category = category;
    
    // Chuyển điều khiển tới middleware tiếp theo
    next();
},

    getProduct: async (req, res, next) => {
        try {
            const productId = req.params.id;

            // Lấy thông tin sản phẩm
            const product = await Product.findById(productId).populate('category');
            if (!product) {
                return res.status(404).json({ message: 'Cannot find product' });
            }

            // Lấy thông tin đánh giá
            const reviews = await ReviewModel.find({ product: productId }).select('comment rating createdAt');
            const reviewCount = reviews.length;
            let totalRating = 0;

            // Tính trung bình số sao đánh giá
            if (reviewCount > 0) {
                totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;
            }

            // Tính thống kê đánh giá
           // Đối tượng để lưu trữ thống kê đánh giá
            const reviewStats = {};

         // Duyệt qua mảng đánh giá
        for (const review of reviews) {
        // Kiểm tra xem đánh giá có tồn tại trong đối tượng thống kê chưa
        if (reviewStats[review.rating]) {
        // Nếu tồn tại, tăng số lượng đánh giá có cùng rating
        reviewStats[review.rating]++;
        }   else {
        // Nếu chưa tồn tại, tạo mới và đặt số lượng đánh giá với rating là 1
        reviewStats[review.rating] = 1;
    }
}

     // Chuyển đối tượng thống kê thành mảng, sắp xếp theo thứ tự từ 1 đến 5
    const reviewStatsArray = Array.from({ length: 5 }, (_, i) => {
    const rating = i + 1;
    // Trả về số lượng đánh giá có rating tương ứng hoặc 0 nếu không có
    return reviewStats[rating] || 0;
});

            res.status(200).json({
                product: product,
                reviewStats: reviewStatsArray,
                avgRating: totalRating,
                reviews: reviews
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
        next();
    },

    getNews: async (req, res, next) => {
        let news;
        try {
            news = await News.findById(req.params.id);
            if (news == null) {
                return res.status(404).json({ message: 'Cannot find news' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.news = news;
        next();
    },

    getColor: async (req, res, next) => {
        let news;
        try {
            news = await color.findById(req.params.id);
            if (news == null) {
                return res.status(404).json({ message: 'Cannot find color' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.news = news;
        next();
    },

    getOrder: async (req, res, next) => {
        try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username') // Lấy thông tin user và chỉ lấy trường name
            .populate({
            path: 'products.product',
            select: 'name',
            }); // Lấy thông tin products và chỉ lấy trường name của product
    
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        console.log(order)
    
          // Truy cập và trả về tên cụ thể của từng ID
        const userName = order.user ? order.user.username : null;
        const productNames = order.products.map((product) => product.product.name);
    
        const result = {
            _id: order._id,
            user: userName,
            products: productNames,
            orderTotal: order.orderTotal,
            address: order.address,
            billing: order.billing,
            status: order.status,
            description: order.description,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    
        res.order = result;
        next();
        } catch (err) {
        return res.status(500).json({ message: err.message });
        }
    },

    checkRole: (role) => async (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    }
}