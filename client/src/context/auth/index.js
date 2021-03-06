import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from '../../api'
import { getCookie, setCookie } from '../../util/Cookies'

const AuthContext = createContext();

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    SET_LOGGED_IN: "SET_LOGGED_IN",
    SET_LOGGED_OUT: "SET_LOGGED_OUT",
    REGISTER_USER: "REGISTER_USER"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });
    const history = useHistory();

    useEffect(() => {
        let loggedIn = getCookie('loggedIn')
        if (loggedIn) {
            auth.getLoggedIn();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.SET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.SET_LOGGED_OUT: {
                setCookie('loggedIn', '', 2)
                return setAuth({
                    user: null,
                    loggedIn: false
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            default:
                return auth;
        }
    }

    auth.loginUser = async function (payload, rememberMe) {
        try {
            const res = await api.loginUser(payload)
            if (res.status === 200) {
                history.push('/') // Get out of login screen
                authReducer({
                    type: AuthActionType.SET_LOGGED_IN,
                    payload: {
                        user: res.data.user,
                        loggedIn: true
                    }
                })
                if (rememberMe) {
                    setCookie('loggedIn', true, 2)
                }
            }
            return ''
        } catch (err) {
            if (err.response.status === 400) {
                return err.response.data.errorMessage
            }
            return 'I\'m not sure what happened...'
        }
    }

    auth.logoutUser = async function () {
        api.logoutUser()
        authReducer({
            type: AuthActionType.SET_LOGGED_OUT
        })   
        history.push('/') // Prevent user from logging back in by going back a page
    }

    auth.getLoggedIn = async function () {
        try {
            const res = await api.getLoggedIn();
            if (res.status === 200) {
                authReducer({
                    type: AuthActionType.SET_LOGGED_IN,
                    payload: {
                        loggedIn: res.data.loggedIn,
                        user: res.data.user
                    }
                });
                console.log('Logged in as: ' + res.data.user.username + ', ' + res.data.loggedIn)
            }
        } catch (err) {
            console.log('Failed to get logged in... ' + err)
        }
    }

    auth.registerUser = async function (userData, store) {
        try {
            const res = await api.registerUser(userData);
            if (res.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: res.data.user
                    }
                })
                history.push("/") // Get out of register screen
            }
            return ''
        } catch (err) {
            console.log(err)
            if (err.response.status === 400) {
                return err.response.data.errorMessage
            }
            return 'Something is wrong with the server...'
        }
    }

    auth.loginAsGuest = async function () {
        authReducer({
            type: AuthActionType.SET_LOGGED_IN,
            payload: {
                user: null,
                loggedIn: true
            }
        })
    }

    return (
        <AuthContext.Provider value={{auth}}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };