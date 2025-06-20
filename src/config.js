const isProduction = process.env.NODE_ENV === "production";

const API_URL = isProduction ? process.env.REACT_APP_BACKEND_URL : "http://localhost:5000";

export default API_URL;
