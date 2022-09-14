import {
  Box,
  Checkbox,
  Divider,
  Group,
  Input,
  Select,
  Switch,
  Text,
} from "@mantine/core";
import { forwardRef, useEffect, useState } from "react";

import { useFirebaseUser } from "../../../services/firebase/user";
import SelectSetting from "../shared/SelectSetting";
import { useDayjs } from "../../../services/dayjs";

const START_YEAR = 2015;
const START_MONTH = 4;

const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth();

function moreThanString(a: string, b: string) {
  return parseInt(a) > parseInt(b);
}

let options = [{ value: "0000-00-00", label: "Unknown" }];
const years = [...Array(thisYear - START_YEAR + 1).keys()]
  .map((v) => v + START_YEAR)
  .map((y) => y.toString());

const allMonths = [...Array(12).keys()]
  .map((v) => v + 1)
  .map((v) => String(v).padStart(2, "0"));
const months: { [year: string]: string[] } = {};

years.forEach((year) => {
  months[year] = [];
  [...Array(12).keys()]
    .map((v) => v + 1)
    .slice(
      year === START_YEAR.toString() ? START_MONTH - 1 : 0,
      year === thisYear.toString() ? thisMonth + 1 : 12
    )
    .map((v) => String(v).padStart(2, "0"))
    .forEach((month) => {
      const option = {
        value: `${year}-${month}-01`,
        label: `${month}/${year}`,
      };
      options.push(option);
      months[year].push(month);
    });
});

function StartPlaying() {
  const dayjs = useDayjs();
  const { user, setUserDataKey } = useFirebaseUser();
  const isFirestoreAccessible =
    !user.loading && user.loggedIn && typeof user.db !== undefined;

  const [picked, setPicked] = useState({
    month: (thisMonth + 1).toString().padStart(2, "0"),
    year: thisYear.toString().padStart(2, "0"),
    unknown: true,
  });
  const [data, setData] = useState(
    (isFirestoreAccessible && user?.db?.profile__start_playing) || "0000-00-00"
  );

  useEffect(() => {
    if (isFirestoreAccessible && user.db) {
      const startPlaying = user.db.profile__start_playing;
      // console.log(user.profile_start_playing);
      if (startPlaying && startPlaying !== "0000-00-00") {
        setPicked({
          month: dayjs(startPlaying).format("MM"),
          year: dayjs(startPlaying).format("YYYY"),
          unknown: false,
        });
      } else {
        setPicked({
          month: (thisMonth + 1).toString().padStart(2, "0"),
          year: thisYear.toString().padStart(2, "0"),
          unknown: true,
        });
      }
    }
  }, [user, dayjs, isFirestoreAccessible]);

  useEffect(() => {
    const resolvedData = picked.unknown
      ? "0000-00-00"
      : `${picked.year}-${picked.month}-01`;
    setData(resolvedData);
    if (
      user.loggedIn &&
      user?.db &&
      user.db?.profile__start_playing &&
      user.db.profile__start_playing !== resolvedData
    ) {
      setUserDataKey({ profile__start_playing: resolvedData });
    } else if (user.loggedIn && user?.db && !user.db?.profile__start_playing) {
      setUserDataKey({ profile__start_playing: resolvedData });
    }
  }, [picked, setUserDataKey, user.loggedIn]);

  return (
    <Input.Wrapper label="Started Playing">
      <Group>
        <Select
          data={years.map((y) => ({ value: y, label: y }))}
          sx={{ flexGrow: 1, flexBasis: 100 }}
          disabled={picked.unknown}
          placeholder="Year"
          searchable
          value={picked.unknown ? null : picked.year}
          onChange={(value) => {
            if (value) {
              setPicked((p) => {
                let currentMonth = p.month;
                const newMonths = months[value];
                if (
                  moreThanString(currentMonth, newMonths[newMonths.length - 1])
                ) {
                  currentMonth = newMonths[newMonths.length - 1];
                } else if (!moreThanString(currentMonth, newMonths[0])) {
                  currentMonth = newMonths[0];
                }
                return {
                  ...p,
                  month: currentMonth,
                  year: value,
                };
              });
            }
          }}
        />
        <Select
          data={
            allMonths.map((m) => ({
              label: dayjs.months()[parseInt(m) - 1],
              value: m,
              disabled: !months?.[picked.year].includes(m),
            })) || []
          }
          sx={{ flexGrow: 1.5, flexBasis: 100 }}
          disabled={picked.unknown}
          placeholder="Month"
          searchable
          value={picked.unknown ? null : picked.month}
          onChange={(value) => {
            if (value) {
              setPicked((p) => ({
                ...p,
                month: value,
              }));
            }
          }}
        />
        {/* <Box sx={{ flexGrow: 1 }} /> */}

        <Checkbox
          label="Unknown"
          checked={picked.unknown}
          onChange={(event) => {
            // DO NOT REMOVE LINE BELOW. THIS IS REQUIRED FOR SOME REASON
            const checked = !!event?.currentTarget?.checked;
            setPicked((p) => ({
              ...p,
              unknown: checked,
            }));
          }}
        />
      </Group>
    </Input.Wrapper>
  );
}

export default StartPlaying;
