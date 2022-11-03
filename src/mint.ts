import {
  Transaction,
  SystemProgram,
  Keypair,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  UploadMetadataInput,
} from "@metaplex-foundation/js";
import secret from "../guideSecret.json";
import { endpoint } from "./constants";
import { MintConfig } from "./MintConfig";

const solanaConnection = new Connection(endpoint);

/**
 *
 * @param wallet Solana Keypair
 * @param tokenMetadata Metaplex Fungible Token Standard object
 * @returns Arweave url for our metadata json file
 */
const uploadMetadata = async (
  wallet: Keypair,
  tokenMetadata: UploadMetadataInput
): Promise<string> => {
  //create metaplex instance on devnet using this wallet
  const metaplex = Metaplex.make(solanaConnection)
    .use(keypairIdentity(wallet))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: endpoint,
        timeout: 60000,
      })
    );

  //Upload to Arweave
  const { uri } = await metaplex.nfts().uploadMetadata(tokenMetadata);
  console.log(`Arweave URL: `, uri);
  return uri;
};

const createNewMintTransaction = async (
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  destinationWallet: PublicKey,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey,
  onChainMetadata: DataV2,
  mintConfig: MintConfig
) => {
  //create metaplex instance on devnet using this wallet
  const metaplex = Metaplex.make(solanaConnection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: endpoint,
        timeout: 60000,
      })
    );
  //Get the minimum lamport balance to create a new account and avoid rent payments
  const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);
  //metadata account associated with mint
  const metadataPDA = await metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintKeypair.publicKey });
  //get associated token account of your wallet
  const tokenATA = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    destinationWallet
  );

  const createNewTokenTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: requiredBalance,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey, //Mint Address
      mintConfig.numDecimals, //Number of Decimals of New mint
      mintAuthority, //Mint Authority
      freezeAuthority, //Freeze Authority
      TOKEN_PROGRAM_ID
    ),
    createAssociatedTokenAccountInstruction(
      payer.publicKey, //Payer
      tokenATA, //Associated token account
      payer.publicKey, //token owner
      mintKeypair.publicKey //Mint
    ),
    createMintToInstruction(
      mintKeypair.publicKey, //Mint
      tokenATA, //Destination Token Account
      mintAuthority, //Authority
      mintConfig.numberTokens * Math.pow(10, mintConfig.numDecimals) //number of tokens
    ),
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mintKeypair.publicKey,
        mintAuthority: mintAuthority,
        payer: payer.publicKey,
        updateAuthority: mintAuthority,
      },
      {
        createMetadataAccountArgsV2: {
          data: onChainMetadata,
          isMutable: true,
        },
      }
    )
  );

  return createNewTokenTransaction;
};

export const mint = async (
  onChainMetadata: DataV2,
  tokenMetadata: UploadMetadataInput,
  mintConfig: MintConfig
) => {
  console.log(`---STEP 1: Uploading MetaData---`);
  const userWallet = Keypair.fromSecretKey(new Uint8Array(secret));
  let metadataUri = await uploadMetadata(userWallet, tokenMetadata);
  onChainMetadata.uri = metadataUri;

  console.log(`---STEP 2: Creating Mint Transaction---`);
  let mintKeypair = Keypair.generate();
  console.log(`New Mint Address: `, mintKeypair.publicKey.toString());

  const newMintTransaction: Transaction = await createNewMintTransaction(
    solanaConnection,
    userWallet,
    mintKeypair,
    userWallet.publicKey,
    userWallet.publicKey,
    userWallet.publicKey,
    onChainMetadata,
    mintConfig
  );

  console.log(`---STEP 3: Executing Mint Transaction---`);
  const transactionId = await solanaConnection.sendTransaction(
    newMintTransaction,
    [userWallet, mintKeypair]
  );
  console.log(`Transaction ID: `, transactionId);
  console.log(
    `Succesfully minted ${mintConfig.numberTokens} ${
      onChainMetadata.symbol
    } to ${userWallet.publicKey.toString()}.`
  );
  console.log(
    `View Transaction: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`
  );
  console.log(
    `View Token Mint: https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}?cluster=devnet`
  );
};
