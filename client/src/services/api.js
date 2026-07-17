import axios from "axios";

const api= axios.create({

    baseURL:"http://localhost:8500/api/v1",
    withCredentials: true

})

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    "http://localhost:8500/api/v1/users/refreshaccessToken",
                    {},
                    { withCredentials: true }
                );

                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);


export default api