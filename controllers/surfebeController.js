// controllers/surfebeController.js
const userController = require('./userController');


const { JSDOM } = require('jsdom');

const sendWSResponse = (ws, data) => {
    ws.send(JSON.stringify(data));
};

// Helper function untuk parse visits dari HTML
function parseVisits(htmlContent) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const visits = [];
    const taskElements = document.querySelectorAll('.task');

    taskElements.forEach(task => {
        const visitData = {
            id: task.querySelector('.task_title')?.textContent?.trim(),
            time: task.querySelector('.task_time span')?.textContent?.trim(),
            price: task.querySelector('.task_price')?.textContent?.trim(),
            visit_start: task.querySelector('.task_btn')?.dataset?.visit_start,
            type: task.querySelector('.task_ico')?.classList.contains('blue') ? 'video' : 'visit'
        };
        visits.push(visitData);
    });

    return visits;
}

exports.registerSurfebe = async (ws, email, siteKey) => {
    try {
        // Get user data
        const userData = await userController.findUserByEmail(email);
        if (!userData.success) {
            return sendWSResponse(ws, {
                success: false,
                error: 'Failed to get user data'
            });
        }

        // Get recaptcha g_response
        const recaptchaResponse = await recaptchaController.getRecaptchaBySiteKey(siteKey);
        if (!recaptchaResponse.success) {
            return sendWSResponse(ws, recaptchaResponse);
        }

        const formData = new FormData();
        formData.append('g-recaptcha-response', recaptchaResponse.data.g_response);
        formData.append('login', userData.data.name);
        formData.append('email', userData.data.email);
        formData.append('password', userData.data.password_surfebe);

        const response = await fetch("https://surfe.be/react-api/auth/reg", {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "multipart/form-data",
                "Cookie": userData.data.cookieSurfebe
            },
            body: formData
        });

        const data = await response.json();

        // Update user cookie if registration successful
        if (data.success) {
            await userController.updateUser(ws, email, {
                isRegisterSurfebe: 1,
                cookieSurfebe: response.headers.get('set-cookie')
            });
        }

        sendWSResponse(ws, data);

    } catch (err) {
        sendWSResponse(ws, {
            success: false,
            error: err.message
        });
    }
};

exports.loginSurfebe = async (ws, email, siteKey) => {
    try {
        // Get user data
        const userData = await userController.findUserByEmail(email);
        if (!userData.success) {
            return sendWSResponse(ws, {
                success: false,
                error: 'Failed to get user data'
            });
        }

        // Get recaptcha g_response
        const recaptchaResponse = await recaptchaController.getRecaptchaBySiteKey(siteKey);
        if (!recaptchaResponse.success) {
            return sendWSResponse(ws, recaptchaResponse);
        }

        const formData = new FormData();
        formData.append('g-recaptcha-response', recaptchaResponse.data.g_response);
        formData.append('login', userData.data.email);
        formData.append('password', userData.data.password_surfebe);

        const response = await fetch("https://surfe.be/react-api/auth/login", {
            method: "POST",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "multipart/form-data",
                "Cookie": userData.data.cookieSurfebe
            },
            body: formData
        });

        const data = await response.json();

        // Update user cookie if login successful
        if (data.success) {
            await userController.updateUser(ws, email, {
                isLoginSurfebe: 1,
                cookieSurfebe: response.headers.get('set-cookie')
            });
        }

        sendWSResponse(ws, data);

    } catch (err) {
        sendWSResponse(ws, {
            success: false,
            error: err.message
        });
    }
};

exports.confirmCaptchaSurfebe = async (ws, email, siteKey) => {
    try {
        // Get user data
        const userData = await findUserByEmail(email);
        if (!userData.success) {
            return sendWSResponse(ws, {
                success: false,
                error: 'Failed to get user data'
            });
        }

        // Get recaptcha g_response
        const recaptchaResponse = await recaptchaController.getRecaptchaBySiteKey(siteKey);
        if (!recaptchaResponse.success) {
            return sendWSResponse(ws, recaptchaResponse);
        }

        const formData = new FormData();
        formData.append('g-recaptcha-response', recaptchaResponse.data.g_response);

        const response = await fetch("https://surfe.be/ext/h-captcha", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": userData.data.cookieSurfebe
            },
            body: formData
        });

        const data = await response.text(); // Gunakan text() karena response bisa berupa HTML

        // Check if response includes success message
        if (data.includes("This window can be closed")) {
            sendWSResponse(ws, {
                success: true,
                message: "Captcha confirmed successfully"
            });
        } else {
            sendWSResponse(ws, {
                success: false,
                error: "Failed to confirm captcha"
            });
        }

    } catch (err) {
        sendWSResponse(ws, {
            success: false,
            error: err.message
        });
    }
};



exports.getProfileSurfebe = async (ws, email) => {
    try {
        // Get user data
        const userData = await userController.findUserByEmail(email);
        if (!userData.success) {
            return sendWSResponse(ws, {
                success: false,
                error: 'Failed to get user data'
            });
        }

        // Get profile
        const response = await fetch("https://surfe.be/react-api/user/profile", {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Cookie": userData.data.cookieSurfebe
            }
        });

        const data = await response.json();

        // Update balance if profile fetched successfully
        if (data.balance) {
            await userController.updateUser(ws, email, {
                balanceSurfebe: data.balance
            });
        }

        sendWSResponse(ws, {
            success: true,
            data: {
                profileName: data.profileName,
                email: data.email,
                username: data.username,
                photo: data.photo,
                balance: data.balance
            }
        });

    } catch (err) {
        sendWSResponse(ws, {
            success: false,
            error: err.message
        });
    }
};


exports.getTasks = async (ws, version, email) => {
    try {
        const userData = await userController.findUserByEmail(email);
        if (!userData.success) {
            return sendWSResponse(ws, {
                success: false,
                error: 'Failed to get user data'
            });
        }

        const response = await fetch("https://surfe.be/ext-v2/popup?ver=" + version, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "content-type": "application/x-www-form-urlencoded",
                "Cookie": userData.data.cookieSurfebe,
                "Origin": "https://surfe.be",
                "Referer": "https://surfe.be/"
            },
            body: "task=false",
            credentials: "include"
        });

        const data = await response.json();

        // Check if response contains captcha
        if (data.content.toLowerCase().includes('h-captcha')) {
            return sendWSResponse(ws, {
                success: false,
                message: "Need Confirm Captcha"
            });
        }

        // Check if response contains login
        if (data.content.toLowerCase().includes('login')) {
            return sendWSResponse(ws, {
                success: false,
                message: "Cookie Expired, Need Login Again"
            });
        }

        const tasks = parseVisits(data.content);

        // Check if tasks array is empty
        if (!tasks || tasks.length === 0) {
            return sendWSResponse(ws, {
                success: false,
                message: "Task Null",
                data: []
            });
        }

        // Tasks available
        sendWSResponse(ws, {
            success: true,
            message: "Task Available",
            data: tasks
        });

    } catch (err) {
        sendWSResponse(ws, {
            success: false,
            error: err.message
        });
    }
};



exports.completeVisit = async (ws, version, key, email) => {
    try {
        // Get user data menggunakan fungsi baru
        const userData = await userController.findUserByEmail(email);
        if (!userData.success) {
            return sendWSResponse(ws, {
                success: false,
                error: 'Failed to get user data'
            });
        }

        const response = await fetch(`https://surfe.be/ext-v2/task-complete?ver=${version}&key=${key}`, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "content-type": "application/x-www-form-urlencoded",
                "Cookie": userData.data.cookieSurfebe,
                "Origin": "https://surfe.be",
                "Referer": "https://surfe.be/"
            },
            credentials: "include"
        });

        const data = await response.json();

        sendWSResponse(ws, {
            success: true,
            data: data
        });
    } catch (err) {
        sendWSResponse(ws, {
            success: false,
            error: err.message
        });
    }
};
