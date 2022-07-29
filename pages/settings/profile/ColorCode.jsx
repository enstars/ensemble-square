import { ColorSwatch, TextInput } from "@mantine/core";
import { useFirebaseUser } from "../../../services/firebase/user";
function ColorCode() {
  const { firebaseUser } = useFirebaseUser();
  const cc = "#" + firebaseUser?.firestore?.suid;
  return (
    <TextInput
      label="Color Code"
      value={cc}
      readOnly
      description={`Your color code is a code unique to you, and cannot be modified or changed.`}
      icon={<ColorSwatch size={16} color={cc} />}
    />
  );
}

export default ColorCode;
