'use strict';


var self = module.exports = {


    checkMissingKey: (obj, objCheck) => {

        // Log đối tượng vào console
        console.log('checkMissingKey>>>>', obj);

        // Duyệt qua các khóa cần kiểm tra
        for (let i = 0; i < objCheck.length; i++) {

            // Kiểm tra xem đối tượng có chứa khóa hiện tại không
            if (!obj.hasOwnProperty(objCheck[i])) {

                // Trả về khóa đầu tiên thiếu sót
                return objCheck[i];
            }
        }
        return 'okay';
    }
};
