/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, ReactElement } from "react";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons";
import { useAuthUser } from "next-firebase-auth";
import { ColorScheme } from "@mantine/core";

import { FirebaseUser, UserData } from "../../types/makotools";

import { getFirestoreUserData, setFirestoreUserData } from "./firestore";

const FirebaseUserContext = React.createContext<{
  user: FirebaseUser;
  setUserDataKey: (data: any, callback?: () => any) => any;
}>({
  user: { loading: true, loggedIn: undefined },
  setUserDataKey: () => {},
});
export const useFirebaseUser = () => useContext(FirebaseUserContext);

function FirebaseUserProvider({
  children,
  colorScheme,
  setAppColorScheme,
  serverData,
}: {
  children: ReactElement;
  colorScheme: ColorScheme;
  setAppColorScheme: (c: ColorScheme) => void;
  serverData: any;
}) {
  const AuthUser = useAuthUser();
  const [user, setFirebaseUser] = useState<FirebaseUser>(
    serverData?.user
      ? {
          loading: false,
          loggedIn: !!AuthUser.id,
          user: serverData.user,
          db: serverData?.db,
        }
      : {
          loading: true,
          loggedIn: undefined,
        }
  );

  const setUserDataKey = (data: any, callback?: () => void) => {
    setFirestoreUserData(data, ({ status }) => {
      if (status === "success") {
        setFirebaseUser((f) =>
          !f.loading && f.loggedIn
            ? {
                ...f,
                db: {
                  ...f.db,
                  ...data,
                },
              }
            : f
        );
        if (callback) callback();
      }
    });
  };

  console.log("firebase user auth ", user);
  useEffect(() => {
    // if (userState.loggedIn) setFirebaseUser((s) => ({ ...s, ...userState }));

    if (AuthUser.id) {
      const userState = {
        loading: false as const,
        loggedIn: true as const,
        user: AuthUser,
      };
      const setFirestoreData = async () => {
        try {
          let currentUserData: UserData | undefined = undefined,
            fetchCount = 5;
          while (!currentUserData && fetchCount > 0 && AuthUser.id) {
            currentUserData = await getFirestoreUserData(AuthUser.id);
            fetchCount--;
          }
          if (typeof currentUserData === "undefined") {
            showNotification({
              title: "Error",
              message:
                "We had trouble fetching your user data. If this is your first time signing up, please try signing in again. If this error persists, please report at the Issues and Suggestions page.",
              color: "red",
              icon: <IconAlertTriangle size={16} />,
            });
            AuthUser.signOut();
          } else {
            setFirebaseUser((s) => ({
              ...s,
              ...userState,
              db: currentUserData as UserData,
            }));
            if (currentUserData?.dark_mode)
              setAppColorScheme(currentUserData.dark_mode ? "dark" : "light");
          }
        } catch (e) {
          console.log("error: ", e);
          showNotification({
            title: "Problem with Firestore",
            message: JSON.stringify(e),
            color: "red",
            icon: <IconAlertTriangle size={16} />,
          });
        }
      };
      setFirestoreData();
    } else {
      const userState = {
        loading: false as const,
        loggedIn: false as const,
      };
      setFirebaseUser((s) => ({ ...s, ...userState }));
    }
  }, [AuthUser]);

  useEffect(() => {
    if (!user.loading && user.loggedIn)
      setUserDataKey({ dark_mode: colorScheme === "dark" });
  }, [colorScheme]);
  // useEffect(() => {
  //   if (typeof user.db.dark_mode !== "undefined") {
  //     setAppColorScheme(user.db.dark_mode ? "dark" : "light");
  //   }
  // }, [user]);

  return (
    <FirebaseUserContext.Provider value={{ user, setUserDataKey }}>
      {children}
    </FirebaseUserContext.Provider>
  );
}

export default FirebaseUserProvider;
