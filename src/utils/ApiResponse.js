class ApiResponse{
    constructor(statusCode, data, message = "success"){
        this.statusCode = statusCode
        this.data
        this.message = message
        this.sucess = statusCode < 400
    }
}

export {ApiResponse}