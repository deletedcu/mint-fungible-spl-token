import { UploadMetadataInput } from "@metaplex-foundation/js";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { MintConfig } from "./MintConfig";

//Replace with your RPC
export const endpoint =
  "https://neat-smart-feather.solana-devnet.discover.quiknode.pro/0207771e8ea3edff85fda01d4ce326bccc502183/";

export const DST_TOKEN_METADATA: UploadMetadataInput = {
  name: "SPD Store Token",
  symbol: "DST",
  description: "This is a solana pay demo store token!",
  image: "https://i.postimg.cc/MZhCwyjk/logo.png", //add public URL to image you'd like to use
};

export const DST_MINT_CONFIG: MintConfig = {
  numDecimals: 6,
  numberTokens: 100000000,
};

export const ON_CHAIN_DST_METADATA: DataV2 = {
  name: DST_TOKEN_METADATA.name!,
  symbol: DST_TOKEN_METADATA.symbol!,
  uri: "TO_UPDATE_LATER",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

export const DWLT_TOKEN_METADATA: UploadMetadataInput = {
  name: "SPD WL Token",
  symbol: "DWLT",
  description: "This is a solana pay demo whitelist token!",
  image: "https://i.postimg.cc/MZhCwyjk/logo.png", //add public URL to image you'd like to use
};

export const DWLT_MINT_CONFIG: MintConfig = {
  numDecimals: 6,
  numberTokens: 100000,
};

export const ON_CHAIN_DWLT_METADATA: DataV2 = {
  name: DWLT_TOKEN_METADATA.name!,
  symbol: DWLT_TOKEN_METADATA.symbol!,
  uri: "TO_UPDATE_LATER",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};
