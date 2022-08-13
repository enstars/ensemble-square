import { Text } from "@mantine/core";
import { forwardRef } from "react";

import SelectSetting from "../shared/SelectSetting";

const nameOrderOptions = [
  {
    value: "firstlast",
    label: "Given name, Family name",
    example: "Eg. Subaru Akehoshi",
  },
  {
    value: "lastfirst",
    label: "Family name, Given name",
    example: "Eg. Akehoshi Subaru",
  },
];

const nameOrderItem = forwardRef(function SelectItem(
  { label, example, ...others },
  ref
) {
  return (
    <div ref={ref} {...others}>
      <Text size="sm">{label}</Text>
      <Text size="xs" color="dimmed">
        {example}
      </Text>
    </div>
  );
});

function NameOrder() {
  return (
    <SelectSetting
      dataKey="name_order"
      label="Preferred name order"
      data={nameOrderOptions}
      description="Japanese, Chinese, and Korean will always be Family name, Given name."
      placeholder={nameOrderOptions[0].label + " (Default)"}
      itemComponent={nameOrderItem}
    />
  );
}

export default NameOrder;