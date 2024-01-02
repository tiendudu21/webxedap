'use strict'
const UserModel = require('../models/user')
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const _const = require('../config/constant');
const authController = {
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Kiểm tra xem email đã tồn tại hay chưa
            const checkEmailExist = await UserModel.findOne({ email: req.body.email });
            if (checkEmailExist) return res.status(200).json('Email is already registered');

            // Tạo một đối tượng UserModel mới với thông tin từ request
            const newUser = await new UserModel({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
                phone: req.body.phone,
                role : req.body.role,
                status: req.body.status
            });
             // Lưu đối tượng người dùng mới vào cơ sở dữ liệu
            const user = await newUser.save();

            // Trả về thông tin người dùng đã được tạo
            res.status(200).json(user);

        } catch (err) {
            // Xử lý lỗi nếu có
            res.status(500).json("Register fails");
        }
    },

    login: async (req, res) => {
        try {
            // tìm kiếm người dùng trong cơ sở dữ liệu dựa trên email từ request.
            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                return res.status(400).json({message: "Unregistered account!", status: false});
            }

            //  so sánh mật khẩu từ request với mật khẩu đã được hash của người dùng từ cơ sở dữ liệu
            const validatePassword = await bcrypt.compareSync(req.body.password, user.password);

            
            if (!validatePassword) {
                res.status(400).json({message: "wrong password!", status: false});
            }
            if (user && validatePassword) {
                const token = jwt.sign({ user: user }, _const.JWT_ACCESS_KEY, { expiresIn: 10000000 });
                res.header('Authorization', token);
                res.status(200).json({ user, token, status: true });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = authController;