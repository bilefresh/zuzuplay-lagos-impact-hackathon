export const getUserInfo = () => {
  const user = typeof window !== "undefined" ? localStorage.getItem('user') : false;
  if (user) {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem('accessToken') : false;
    const userData = JSON.parse(user).data
    console.log(userData)
    return { ...userData, accessToken }
  }
  return null
};

// import { apiService } from "./apiService";

// export const getUserInfo = async () => {
//     const user = await apiService.profile();
//     return await user;
//   };