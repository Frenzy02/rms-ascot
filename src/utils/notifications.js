import { toast as notifyToast } from 'react-toastify'

export const notification = (type, message, option) => {
    notifyToast[type](message, option)
}

export const showErrorModal = (message) => {
    // You can implement your custom error modal logic here
    console.error('Error:', message)
    // Example: You can use notifyToast for error notifications
    notifyToast.error(message, { autoClose: 5000 })
}

export const customToast = (message) => {
    // You can implement your custom toast logic here
    notifyToast.info(message, { autoClose: 5000 })
}

// Additional utility functions if needed
