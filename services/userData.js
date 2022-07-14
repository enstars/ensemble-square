import React, { useContext, useState, useEffect } from "react";
import { useAuth } from "./auth";
import { getFirestoreUserData, setFirestoreUserData } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { showNotification } from "@mantine/notifications";

import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons";
import { useAuthUser } from "next-firebase-auth";

const UserDataContext = React.createContext();
export const useUserData = () => useContext(UserDataContext);

function UserDataProvider({ children, setAppColorScheme }) {
  // const { user } = useAuth();

  const AuthUser = useAuthUser();
  // const [userData, setUserData] = useState({ loading: true });
  const [userData, setUserData] = useState({
    loading: true,
  });

  const setUserDataKey = (data) => {
    setUserData({ ...userData, ...data });
    setFirestoreUserData(data);
  };
  // console.log(userData, AuthUser);
  useEffect(() => {
    setUserData({
      loading: false,
      loggedIn: !!AuthUser.id,
      user: AuthUser,
    });

    // if (user.loggedIn) {
    //   try {
    //     const currentUserData = await getFirestoreUserData(user.id);
    //     // console.log(currentUserData);
    //     if (currentUserData?.user)
    //       currentUserData.user = JSON.parse(currentUserData.user);
    //     currentUserData.loading = false;
    //     currentUserData.loggedIn = true;
    //     setUserData(currentUserData);
    //   } catch (e) {
    //     console.log(e);
    //     showNotification({
    //       message: JSON.stringify(e),
    //       color: "red",
    //       icon: <IconAlertTriangle size={16} />,
    //     });
    //   }
    // }
  }, [AuthUser]);
  useEffect(() => {
    // onAuthStateChanged(auth, async (currentUser) => {
    //   try {
    //     if (currentUser?.uid) {
    //       const currentUserData = await getFirestoreUserData(currentUser.uid);
    //       // console.log(currentUserData);
    //       if (currentUserData?.user)
    //         currentUserData.user = JSON.parse(currentUserData.user);
    //       currentUserData.loading = false;
    //       currentUserData.loggedIn = true;
    //       setUserData(currentUserData);
    //     } else setUserData({ loading: false, loggedIn: false });
    //   } catch (e) {
    //     console.log(e);
    //     showNotification({
    //       message: JSON.stringify(e),
    //       color: "red",
    //       icon: <IconAlertTriangle size={16} />,
    //     });
    //   }
    // });
  }, []);

  useEffect(() => {
    if (typeof userData.dark_mode !== "undefined") {
      setAppColorScheme(userData.dark_mode ? "dark" : "light");
    }
  }, [userData]);

  return (
    <UserDataContext.Provider value={{ userData, setUserDataKey }}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserDataProvider;
