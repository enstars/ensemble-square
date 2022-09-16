type ID = number;
type HexColorWithTag = string;

// CHARACTERS

type CharacterID = number;
type UnitID = number;

/** Strings extracted from the game, or translated strings  */
type Text = string;

interface GameCharacterStrings<Type = string> {
  last_name: Type;
  first_name: Type;
  last_nameRuby?: Type;
  first_nameRuby?: Type;
  character_voice: Type;
  hobby: Type;
  specialty: Type;
  school?: Type;
  class?: Type;
  quote: Type;
  tagline: Type;
  introduction: Type;
}

interface GameCharacter extends GameCharacterStrings {
  character_id: CharacterID;
  unit: ID[];
  image_color?: HexColorWithTag;
  height: string;
  weight: string; // TBA: Remove units from these fields
  birthday: string; // TBA: Turn into ISO8601-compliant
  age?: number;
  blood_type: "A" | "B" | "O" | "AB";
  circle?: string[];
  sort_id: number;
  horoscope: number;
}

interface GameUnit {
  unit_id: UnitID;
  unit?: string;
  unit_name?: string;
  tagline?: string;
  unit_desc?: string;
  agency?: string;
  image_color?: HexColorWithTag;
  order: number;
}

// CARDS

type CardID = number;
type CardRarity = 1 | 2 | 3 | 4 | 5;
type CardAttribute = 1 | 2 | 3 | 4;
type CardSubStat = 0 | 1 | 2;
type ObtainType = "gacha" | "event" | "special" | "campaign";
type ObtainSubType =
  | "initial"
  | "event"
  | "unit"
  | "feature"
  | "tour"
  | "shuffle"
  | "anniv";

type Stat = number;
interface Stats {
  da: Stat;
  vo: Stat;
  pf: Stat;
}
type StatLevel = "min" | "max" | "ir" | "ir1" | "ir2" | "ir3" | "ir4";

type SkillEffect = any[];
interface SkillStrings {
  name?: string;
  description?: string;
}
interface SkillStringsLive extends SkillStrings {
  live_skill_type_name?: string;
}
interface SkillStringsSupport extends SkillStrings {
  support_skill_type_name?: string;
}
interface SkillData {
  type_id: ID;
  effect_values: SkillEffect[];
}
type SkillType = "center" | "live" | "support";

interface CenterSkill extends SkillData, SkillStrings {}
interface LiveSkill extends SkillData, SkillStringsLive {
  duration: number;
}
interface SupportSkill extends SkillData, SkillStringsSupport {}

interface GameCardStrings {
  title: string;
  name?: string;
  obtain?: {
    name?: string;
  };
}

interface GameCardRegional extends GameCardStrings {
  releaseDate: string;
}

interface GameCard extends GameCardRegional {
  id: CardID;
  rarity: CardRarity;
  character_id: CharacterID;
  type: CardAttribute;
  substat_type: CardSubStat;
  obtain?: {
    type?: ObtainType;
    subType?: ObtainSubType;
    id?: ID;
  };
  stats?: {
    [Level in StatLevel]: Stats;
  };
  skills?: {
    ["center"]?: CenterSkill;
    ["live"]?: LiveSkill;
    ["support"]?: SupportSkill;
  };
  spp?: {
    song_id: ID;
    type_id?: ID;
    name?: string;
  };
}
