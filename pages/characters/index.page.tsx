import React, { useState, useEffect } from "react";
import _ from "lodash";
import {
  Select,
  Box,
  Paper,
  Group,
  Text,
  useMantineTheme,
} from "@mantine/core";

import { getData, getLocalizedData } from "../../services/ensquare";
import PageTitle from "../../components/sections/PageTitle";
import { getLayout } from "../../components/Layout";
import getServerSideUser from "../../services/firebase/getServerSideUser";

import CharacterCard from "./components/DisplayCard";

interface CharacterCardProps {
  i: number;
  doubleface: boolean;
  characters?: any;
  unique_id?: string;
}

function Page({
  characters,
  unit_to_characters: unitToCharacters,
  units,
}: {
  characters: any;
  unit_to_characters: any;
  units: any;
}) {
  console.log(characters, unitToCharacters, units);

  const [listCharacters, setListCharacters] = useState<CharacterCardProps[]>(
    []
  );
  const [filterOptions, setfilterOptions] = useState<GameUnit[]>([]);
  const [chosenUnit, setChosenUnit] = useState<string | null>(null);
  const theme = useMantineTheme();
  useEffect(() => {
    let charactersWithUnits: GameCharacter[] = unitToCharacters.data;

    if (chosenUnit) {
      console.log(chosenUnit);
      const filterOptionsChosenID = parseInt(chosenUnit);
      charactersWithUnits = charactersWithUnits.filter(
        (character: GameCharacter) =>
          filterOptionsChosenID === character.unit_id
      );
    }
    const charactersWithUnitsSorted = _.sortBy(charactersWithUnits, [
      function findUnitOrder(charactersWithUnit) {
        const thisUnit: GameUnit = units.data.filter(
          (unit: GameUnit) => unit.unit_id === charactersWithUnit.unit_id
        )[0] || {
          name: "MaM",
          order: 14,
        }; // MaM *sobs* mama... cries
        // eslint-disable-next-line dot-notation
        return thisUnit.order;
      },
      "order_num_in_unit_as_list",
    ]);

    const charactersFiltered = charactersWithUnitsSorted.map((charaUnit) => {
      const charIndex = characters.main.data.indexOf(
        characters.main.data.filter(
          (chara: GameCharacter) =>
            chara.character_id === charaUnit.character_id
        )[0]
      );

      return {
        i: charIndex,
        doubleface: charaUnit.unit_id === 17,
        unique_id: `${characters.main.data?.[charIndex]?.character_id}-${charaUnit.unit_id}`,
      };
    });

    setListCharacters(charactersFiltered);
    setfilterOptions(
      units.data.sort((a: any, b: any) => !!(a?.order > b?.order))
    );
  }, [characters.main.data, chosenUnit, unitToCharacters.data, units.data]);

  const handleNewUnit = (e: string) => {
    setChosenUnit(e);
  };

  // if (!hasAllData) {
  //     // This should probably be a more friendly loading state lol
  //     return null;
  // }

  return (
    <>
      <PageTitle title="Characters" />
      <Paper mb="sm" p="md" withBorder>
        <Text weight="700" size="xs" color="dimmed">
          Search Options
        </Text>
        <Group>
          <Select
            label="Unit"
            placeholder="Pick a unit..."
            data={filterOptions.map((o: GameUnit) => {
              return o.unit_id + "";
            })}
            onChange={handleNewUnit}
            searchable
            clearable
            allowDeselect
            size="sm"
            variant="default"
          />
        </Group>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr));",
          gap: theme.spacing.xs,
        }}
      >
        {listCharacters.map((character) => {
          return (
            <CharacterCard
              key={character.unique_id}
              {...character}
              characters={characters}
            />
          );
        })}
      </Box>
    </>
  );
}

export const getServerSideProps = getServerSideUser(async ({ res, locale }) => {
  const characters = await getLocalizedData("characters", locale);
  const unit_to_characters = await getData("unit_to_characters", "ja", true);
  const units = await getData("units", "ja", true);

  console.log("units", units);

  return {
    props: { characters, unit_to_characters, units },
  };
});
Page.getLayout = getLayout({ wide: true });
export default Page;