const UserData = require('../models/UserData');
const { randomUUID } = require('crypto');
const CONSTANTS = require('../utils/constants')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const {extractUserId} = require('../utils/jwtUtils');

// get config vars
dotenv.config();

async function getAllUsers(token) {
    try {
        const userRole = await extractUserRole(token);

        if(userRole == CONSTANTS.ADMIN) {
            const users = await UserData.find({});
            // Omit the password field for each user before returning the result
            const usersWithoutPassword = users.map(user => {
                const userWithoutPassword = user.toObject();
                delete userWithoutPassword.password;
                return userWithoutPassword;
            });

            console.log('Found Users data from MongoDB Time Series Database:', usersWithoutPassword);
            return usersWithoutPassword;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw error;
    }
}


// Pass the io object as a parameter
async function getUserById(userId, token) {
    try {
        const userRole = await extractUserRole(token);

        if(userRole == CONSTANTS.ADMIN) {
            const user = await UserData.findOne({ userId: userId });

            if (!user) {
                throw new Error('User not found');
            }
    
            // Omit the password field before returning the result
            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;
    
            console.log('Found user data from MongoDB Time Series Database:', userWithoutPassword);
    
            return userWithoutPassword;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw error;
    }
}


// Pass the io object as a parameter
async function saveUser(data, token) {
    try {
        const userRole = await extractUserRole(token);

        if(userRole == CONSTANTS.ADMIN) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const newData = new UserData({
                userId: randomUUID(),
                name: data.name,
                surname: data.surname,
                role: CONSTANTS.CUSTOMER,
                email: data.email,
                //password: encrypt(data.password),
                password: hashedPassword
            });

            const savedData = await newData.save();

            // Omit the password field before returning the result
            const resultWithoutPassword = savedData.toObject();
            delete resultWithoutPassword.password;

            console.log('user data saved to MongoDB Time Series Database:', resultWithoutPassword);
            return resultWithoutPassword;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
}


async function updateUser(user, userId, token) {
    try {
        const userRole = await extractUserRole(token);

        if(userRole == CONSTANTS.ADMIN) {
            // check if user exists
            const existingUser = await UserData.findOne({ userId: userId });
            if (!existingUser) {
                throw new Error('User not found');
            }

            // create new object
            const updatedUserData = {
                name: user.name,
                surname: user.surname,
                email: user.email,
            };

            if (user.password) {
                updatedUserData.password = encrypt(user.password);
            }

            // update the user with new data
            const result = await UserData.findOneAndUpdate({ userId: userId }, {
                $set: updatedUserData
            }, { new: true }); // Adding { new: true } ensures that the updated document is returned

            // Omit the password field before returning the result
            const resultWithoutPassword = result.toObject();
            delete resultWithoutPassword.password;

            console.log('user data updated to MongoDB Time Series Database:', resultWithoutPassword);

            return resultWithoutPassword;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }

    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}

// Pass the io object as a parameter
async function deleteUserById(userId, token) {
    try {
        const userRole = await extractUserRole(token);

        if(userRole == CONSTANTS.ADMIN) {
            const result = await UserData.findOneAndDelete({ userId: userId });
            if (!result) {
                throw new Error('User not found');
            }
    
            // Omit the password field before returning the result
            const resultWithoutPassword = result.toObject();
            delete resultWithoutPassword.password;
    
            console.log('User is deleted from the database with id:', userId);
    
            return resultWithoutPassword;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }


    } catch (error) {
        console.error('Error while deleting the user:', error);
        throw error;
    }
}

// Pass the io object as a parameter
async function deleteAllUsers(token) {
    try {
        const userRole = await extractUserRole(token);

        if(userRole == CONSTANTS.ADMIN) {
            const result = await UserData.deleteMany({});
            console.log('Users database is purged.');
    
            return result;
        } else {
            throw new Error('Requestor is not allowed to access this resource')
        }


    } catch (error) {
        console.error('Error while deleting users:', error);
        throw error;
    }
}

// Pass the io object as a parameter
async function loginUser(data) {
    try {
        const user = await UserData.findOne({ email: data.email });

        if (!user) {
            throw new Error('User not found');
        }

        // Use bcrypt.compare with async/await
        const passwordCheck = await bcrypt.compare(data.password, user.password);

        if (!passwordCheck) {
            throw new Error('Passwords do not match');
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user.userId,
                userEmail: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1800s' }
        );

        // Return success response
        return {token: token, role: user.role};
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}

async function extractUserRole(token) {
    try {
        const userId = extractUserId(token);

        if(!userId) {
            throw new Error("Invalid token");
        }

        const user = await UserData.findOne({ userId: userId });
        if(user) {
            return user.role;
        } else {
            throw new Error("User not found");
        }
    } catch (error) {
        throw error;
    }
}

async function registerAdmin(data, apiKey) {
    try {
        if(apiKey != process.env.API_KEY){
            throw new Error('Invalid api key')
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newData = new UserData({
            userId: randomUUID(),
            name: data.name,
            surname: data.surname,
            role: CONSTANTS.ADMIN,
            email: data.email,
            password: hashedPassword
        });

        const savedData = await newData.save();

        // Omit the password field before returning the result
        const resultWithoutPassword = savedData.toObject();
        delete resultWithoutPassword.password;

        console.log('user data saved to MongoDB Time Series Database:', resultWithoutPassword);
        return resultWithoutPassword;
    } catch (error) {
        console.error('Error registering new admin user:', error);
        throw error;
    }
}


module.exports = {
    saveUser,
    updateUser,
    getUserById,
    getAllUsers,
    deleteUserById,
    deleteAllUsers,
    loginUser,
    registerAdmin,
    extractUserRole
};
