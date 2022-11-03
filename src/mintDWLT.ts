import {
  DWLT_MINT_CONFIG,
  DWLT_TOKEN_METADATA,
  ON_CHAIN_DWLT_METADATA,
} from "./constants";
import { mint } from "./mint";

mint(ON_CHAIN_DWLT_METADATA, DWLT_TOKEN_METADATA, DWLT_MINT_CONFIG);
