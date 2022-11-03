import {
  DST_MINT_CONFIG,
  DST_TOKEN_METADATA,
  ON_CHAIN_DST_METADATA,
} from "./constants";
import { mint } from "./mint";

mint(ON_CHAIN_DST_METADATA, DST_TOKEN_METADATA, DST_MINT_CONFIG);
