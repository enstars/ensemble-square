import { Box, Group, Select, SelectProps, Text } from "@mantine/core";
import { forwardRef, ReactElement } from "react";

import { useFirebaseUser } from "../../../services/firebase/user";
import { UserData } from "../../../types/makotools";

const SelectItemForwardRef = forwardRef<HTMLDivElement>(function SelectItem(
  { label, icon, ...props }: { label: string; icon: ReactElement },
  ref
) {
  return (
    <div ref={ref} {...props}>
      <Group spacing="xs">
        {icon}
        <Text size="sm">{label}</Text>
      </Group>
    </div>
  );
});

function SelectSetting({
  label,
  dataKey,
  data,
  ...props
}: Omit<SelectProps, "data"> & {
  label: string;
  dataKey: keyof UserData;
  data: any[];
}) {
  const { firebaseUser, setUserDataKey } = useFirebaseUser();

  const isFirestoreAccessible =
    !firebaseUser.loading && firebaseUser.loggedIn && firebaseUser?.firestore;
  return (
    <Select
      value={
        isFirestoreAccessible ? firebaseUser.firestore?.[dataKey] : undefined
      }
      label={label}
      onChange={(value) => {
        setUserDataKey({ [dataKey]: value });
      }}
      itemComponent={SelectItemForwardRef}
      icon={
        (isFirestoreAccessible &&
          data.filter((r) => r.value === firebaseUser.firestore?.[dataKey])[0]
            ?.icon) ||
        null
      }
      data={data}
      {...props}
    />
  );
}

export default SelectSetting;