import { useState, useEffect, useMemo } from "react";
import {
  useMantineTheme,
  Text,
  Paper,
  Group,
  Select,
  Chip,
  Input,
  Center,
  Loader,
  Switch,
  MultiSelect,
  Button,
  Card,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import {
  IconArrowsSort,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons";
import { slice } from "lodash";
import fuzzysort from "fuzzysort";

import Layout from "../../components/Layout";
import {
  getItemFromLocalizedDataArray,
  getLocalizedDataArray,
} from "../../services/ensquare";
import PageTitle from "../../components/sections/PageTitle";
import { getLayout } from "../../components/Layout";
import getServerSideUser from "../../services/firebase/getServerSideUser";
import { QuerySuccess } from "../../types/makotools";

import CardCard from "./components/DisplayCard";
type SortOption = "id" | "character";

interface CardViewOptions {
  filterRarity: CardRarity[];
  filterCharacters: string[];
  sortOption: SortOption;
  searchQuery: string;
  sortDescending: boolean;
}

const CARD_LIST_INITIAL_COUNT = 20;
const CARD_VIEW_OPTIONS_DEFAULT: CardViewOptions = {
  filterRarity: [5],
  filterCharacters: [],
  sortOption: "id",
  searchQuery: "",
  sortDescending: false,
};

function Page({
  charactersQuery,
  cardsQuery,
}: {
  charactersQuery: QuerySuccess<GameCharacter[]>;
  cardsQuery: QuerySuccess<GameCard[]>;
}) {
  const cards = useMemo(() => cardsQuery.data, []);
  const characters = useMemo(() => charactersQuery.data, []);

  // console.log(cards, characters);

  const theme = useMantineTheme();
  const [count, setCount] = useState<number>(CARD_LIST_INITIAL_COUNT);
  const [cardsList, setCardsList] = useState<GameCard[]>([]);
  const [slicedCardsList, setSlicedCardsList] = useState<GameCard[]>([]);
  const [viewOptions, setViewOptions] = useLocalStorage<CardViewOptions>({
    key: "cardFilters",
    defaultValue: CARD_VIEW_OPTIONS_DEFAULT,
  });
  const [cardOptions, setCardOptions] = useLocalStorage({
    key: "cardOptions",
    defaultValue: {
      showFullInfo: false,
    },
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 200);

  let characterIDtoSort: { [key: number]: number } = {};
  characters.forEach((c) => {
    characterIDtoSort[c.character_id] = c.sort_id;
  });

  // console.log(characterIDtoSort);
  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "id", label: "Card ID" },
    {
      value: "character",
      label: "Character",
    },
  ];

  const descendingNum = viewOptions.sortDescending ? -1 : 1;
  const SORT_FUNCTIONS = {
    id: (a: any, b: any) => (a.id - b.id) * descendingNum,
    character: (a: any, b: any) =>
      (characterIDtoSort[a.character_id] - characterIDtoSort[b.character_id]) *
      descendingNum,
  };

  useEffect(() => {
    let filteredList: GameCard[] = cards
      .filter((c) => {
        return c.id <= 9999;
      })
      .filter((c) => {
        return viewOptions.filterRarity.includes(c.rarity);
      })
      .filter((c) => {
        if (viewOptions.filterCharacters.length)
          return viewOptions.filterCharacters.includes(
            c.character_id.toString()
          );
        return true;
      });
    // console.log(
    //   fuzzysort.go(viewOptions.searchQuery, filteredList, {
    //     key: "title",
    //     all: true,
    //   })
    // );

    const searchableList = filteredList.map((c) => ({
      data: c,
    }));
    const searchedList = fuzzysort.go(debouncedSearch, filteredList, {
      keys: ["title.0", "title.1", "title.2"],
      all: true,
    });
    const sortedList = [...searchedList]
      .sort((a: any, b: any) => b.score - a.score)
      .map((cr) => cr.obj)
      .sort(SORT_FUNCTIONS["id"])
      .sort(SORT_FUNCTIONS[viewOptions.sortOption]);
    setCardsList(sortedList);
    setCount(CARD_LIST_INITIAL_COUNT);
  }, [viewOptions, debouncedSearch]);

  useEffect(() => {
    setSlicedCardsList(cardsList.slice(0, count));
  }, [cardsList, count]);

  const loadMore = () => {
    const newCount = count + CARD_LIST_INITIAL_COUNT;
    setCount(newCount);
  };

  return (
    <>
      <PageTitle title="Cards" />

      <Paper mb="sm" p="md" withBorder>
        <Text weight="700" size="xs" color="dimmed">
          <IconSearch size="1em" /> Search Options
        </Text>
        <Group sx={{ alignItems: "flex-start" }}>
          <TextInput
            label="Search"
            placeholder="Type a card name..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            sx={{ maxWidth: 200 }}
            variant="default"
            icon={<IconSearch size="1em" />}
          />
          <Select
            label="Sort by"
            placeholder="Pick a unit..."
            data={SORT_OPTIONS}
            value={viewOptions.sortOption}
            onChange={(val: SortOption) => {
              if (val) setViewOptions({ ...viewOptions, sortOption: val });
            }}
            sx={{ maxWidth: 200 }}
            variant="default"
            icon={<IconArrowsSort size="1em" />}
            rightSection={
              <Tooltip label="Toggle ascending/descending">
                <ActionIcon
                  onClick={() => {
                    setViewOptions((v) => ({
                      ...viewOptions,
                      sortDescending: !v.sortDescending,
                    }));
                  }}
                  variant="light"
                  color="blue"
                >
                  {viewOptions.sortDescending ? (
                    <IconSortAscending size={16} />
                  ) : (
                    <IconSortDescending size={16} />
                  )}
                </ActionIcon>
              </Tooltip>
            }
          />
          <MultiSelect
            label="Characters"
            placeholder="Pick a character..."
            data={characters
              .sort(
                (a: any, b: any) =>
                  characterIDtoSort[a.character_id] -
                  characterIDtoSort[b.character_id]
              )
              .map((c) => {
                return {
                  value: c.character_id.toString(),
                  label: c.first_name[0],
                };
              })}
            value={viewOptions.filterCharacters}
            onChange={(val) => {
              setViewOptions({ ...viewOptions, filterCharacters: val });
            }}
            sx={{ width: "100%", maxWidth: 400 }}
            variant="default"
            searchable
          />
          <Input.Wrapper id="rarity" label="Rarity">
            <Chip.Group
              multiple
              value={viewOptions.filterRarity.map((v) => v.toString())}
              onChange={(value) => {
                const filterRarity = value.map(
                  (v) => parseInt(v, 10) as CardRarity
                );
                // console.log(filterRarity);
                setViewOptions({ ...viewOptions, filterRarity });
              }}
              spacing={3}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <Chip
                  key={r}
                  value={r.toString()}
                  radius="md"
                  styles={{
                    label: { paddingLeft: 10, paddingRight: 10 },
                    iconWrapper: { display: "none" },
                  }}
                  color="yellow"
                  variant="filled"
                >
                  {r}
                </Chip>
              ))}
            </Chip.Group>
          </Input.Wrapper>
        </Group>
        <Group mt="xs">
          <Switch
            label="Show full info"
            checked={cardOptions.showFullInfo}
            onChange={(event) =>
              setCardOptions({
                ...cardOptions,
                showFullInfo: event.currentTarget.checked,
              })
            }
          />
          <Button
            compact
            onClick={() => {
              setViewOptions(CARD_VIEW_OPTIONS_DEFAULT);
            }}
          >
            Reset all filters
          </Button>
        </Group>
      </Paper>
      {slicedCardsList.length ? (
        <>
          <Text color="dimmed" mt="xl" mb="sm" size="sm">
            {cardsList.length} results found.
          </Text>
          <InfiniteScroll
            dataLength={slicedCardsList.length} //This is important field to render the next data
            next={loadMore}
            hasMore={count < cardsList.length}
            loader={
              <Center sx={{ gridColumn: "s/e" }} my="lg">
                <Loader variant="bars" />
              </Center>
            }
            style={{
              display: "grid",
              gridTemplateColumns:
                "[s] repeat(auto-fill, minmax(224px, 1fr)) [e]",
              gap: theme.spacing.xs,
              alignItems: "flex-start",
            }}
          >
            {slicedCardsList.map((e, i) => (
              <CardCard
                key={e.id}
                cardOptions={cardOptions}
                card={e}
                lang={cardsQuery.lang}
              />
            ))}
          </InfiniteScroll>
        </>
      ) : (
        <Text align="center" color="dimmed" mt="xl" mb="sm" size="sm">
          No cards found.
        </Text>
      )}
    </>
  );
}

export const getServerSideProps = getServerSideUser(async ({ res, locale }) => {
  const characters = await getLocalizedDataArray<GameCharacter>(
    "characters",
    locale,
    "character_id",
    ["character_id", "first_name", "sort_id"]
  );
  // const unit_to_characters = await getLocalizedData("unit_to_characters");
  // const units = await getLocalizedData("units");
  const cards = await getLocalizedDataArray<GameCard>("cards", locale, "id", [
    "id",
    "name",
    "title",
    "type",
    "rarity",
    "stats.ir.da",
    "stats.ir.vo",
    "stats.ir.pf",
    "stats.ir4.da",
    "stats.ir4.vo",
    "stats.ir4.pf",
    "character_id",
  ]);

  if (characters.status === "error" || cards.status === "error")
    return {
      notFound: true,
    };
  return {
    props: { charactersQuery: characters, cardsQuery: cards },
  };
});

Page.getLayout = getLayout({ wide: true });
export default Page;
