import Head from "next/head";
import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Connection, PublicKey } from "@solana/web3.js";
import { Elusiv, PrivateTxWrapper, SEED_MESSAGE } from "@elusiv/sdk";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "react-responsive";
import { MainNav } from "@/components/ui/main-nav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const inter = Inter({ subsets: ["latin"] });
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Custom Hooks
const useScreenSize = () => {
  const isSmallScreen = useMediaQuery({ query: "(max-width: 639px)" });
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });
  const width = isSmallScreen ? "350px" : isLargeScreen ? "450px" : "100%";

  return { isSmallScreen, isLargeScreen, width };
};

const useWalletState = () => {
  const wallet = useWallet();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [elusivInstance, setElusivInstance] = useState<Elusiv | null>(null);

  return {
    wallet,
    isSignedIn,
    setIsSignedIn,
    elusivInstance,
    setElusivInstance,
  };
};

const useTransactionState = () => {
  const [transactions, setTransactions] = useState<PrivateTxWrapper[] | null>(
    null
  );
  const [progress, setProgress] = useState(0);

  return { transactions, setTransactions, progress, setProgress };
};

const useBalanceState = () => {
  const [userTokenBalance, setUserTokenBalance] = useState<string | null>(null);
  const [userPrivateTokenBalance, setUserPrivateTokenBalance] = useState<
    string | null
  >(null);

  return {
    userTokenBalance,
    setUserTokenBalance,
    userPrivateTokenBalance,
    setUserPrivateTokenBalance,
  };
};

const useSendState = () => {
  const [topupAmount, setTopupAmount] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendPublicKey, setSendPublicKey] = useState("");
  const [isSendClicked, setIsSendClicked] = useState(false);
  const [isTurboSendClicked, setIsTurboSendClicked] = useState(false);
  const [isSendWoPubKeyEnabled, setIsSendWoPubKeyEnabled] = useState(false);

  return {
    topupAmount,
    setTopupAmount,
    sendAmount,
    setSendAmount,
    sendPublicKey,
    setSendPublicKey,
    isSendClicked,
    setIsSendClicked,
    isTurboSendClicked,
    setIsTurboSendClicked,
    isSendWoPubKeyEnabled,
    setIsSendWoPubKeyEnabled,
  };
};

export default function Home() {
  const { isSmallScreen, isLargeScreen, width } = useScreenSize();
  const {
    wallet,
    isSignedIn,
    setIsSignedIn,
    elusivInstance,
    setElusivInstance,
  } = useWalletState();
  const { transactions, setTransactions, progress, setProgress } =
    useTransactionState();
  const {
    userTokenBalance,
    setUserTokenBalance,
    userPrivateTokenBalance,
    setUserPrivateTokenBalance,
  } = useBalanceState();
  const {
    topupAmount,
    setTopupAmount,
    sendAmount,
    setSendAmount,
    sendPublicKey,
    setSendPublicKey,
    isSendClicked,
    setIsSendClicked,
    isTurboSendClicked,
    setIsTurboSendClicked,
    isSendWoPubKeyEnabled,
    setIsSendWoPubKeyEnabled,
  } = useSendState();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (wallet.connected) {
      handleSignIn();
    }
  }, [wallet.connected]);

  const handleSignIn = async () => {
    if (!wallet.connected) return;

    if (!wallet.publicKey || !wallet.signMessage) return;

    const message = new TextEncoder().encode(SEED_MESSAGE);

    try {
      const signedMessage = await wallet.signMessage(message);
      const connection = new Connection("https://api.devnet.solana.com/");
      const seed = signedMessage;
      const instance = await Elusiv.getElusivInstance(
        seed,
        wallet.publicKey!,
        connection,
        "mainnet-beta"
      );

      // Convert the instance to 'any' type
      const instanceAny = instance as any;

      setIsSignedIn(true);
      setElusivInstance(instanceAny);
      toast({
        title: "Successfully signed in!",
        description: "User has sucessfully signed in with Elusiv.",
      });
    } catch (error) {
      console.log("Sign Message Error:", error);
      toast({
        title: "Sign Message Error",
        description: "User rejected the request.",
        action: <Button onClick={handleSignIn}>Retry</Button>,
      });
    }
  };

  const handleSignOut = async () => {
    if (wallet.connected) {
      wallet.disconnect();
    }

    setIsSignedIn(false);
    setElusivInstance(null);
  };

  const handleTopUp = async () => {
    setLoading(true);
    toast({
      title: "TopUp Initiated!",
      description:
        "Please approve the transaction to TopUp your Elusiv Private Balance.",
    });
    if (!elusivInstance || !wallet.signTransaction) return;

    try {
      const connection = new Connection("https://api.devnet.solana.com/");

      // Convert amount from Sol to Lamports (1 Sol = 1e9 Lamports)
      const amountInDecimals = parseFloat(topupAmount) * 10 ** 9;
      const topupTx = await elusivInstance.buildTopUpTx(
        amountInDecimals,
        "SAMO"
      );
      const signedTransaction = await wallet.signTransaction(topupTx.tx);

      signedTransaction.lastValidBlockHeight = (
        await connection.getLatestBlockhash()
      ).lastValidBlockHeight;
      topupTx.tx = signedTransaction;
      console.log("Signed Transaction:", signedTransaction);

      const res = await elusivInstance.sendElusivTxWithTracking(topupTx);
      await connection.confirmTransaction(
        {
          signature: res.elusivTxSig.signature,
          lastValidBlockHeight: topupTx.tx.lastValidBlockHeight!,
          blockhash: topupTx.tx.recentBlockhash!,
        },
        "confirmed"
      );
      toast({
        title: "Successful Top-Up",
        description: "User has sucessfully topped up Elusiv private balance.",
      });
    } catch (error) {
      console.log("Sign Message Error:", error);
      toast({
        title: "Top-Up Error",
        description:
          "There was an error topping-up your Elusiv Private Balance",
      });
    } finally {
      setLoading(false);
    }
  };

  type ToastWithLinkProps = {
    message: string;
    link: string;
  };

  const ToastWithLink: React.FC<ToastWithLinkProps> = ({ message, link }) => (
    <div>
      <p>{message}</p>
      <a
        href={link}
        rel="noopener noreferrer"
        style={{ color: "blue", textDecoration: "underline" }}
      >
        {link}
      </a>
    </div>
  );

  const delay = (ms: number | undefined) =>
    new Promise((res) => setTimeout(res, ms));

  const handleTurboSend = async () => {
    if (!elusivInstance) return;
    let intervalId: string | number | NodeJS.Timer | undefined;

    try {
      setLoading(true);
      toast({
        title: "Turbo Mode Activated!",
        description:
          "You have requested for Turbo Mode. Please wait for 2 minutes for your transaction to be processed.",
      });
      setProgress(0);
      const startTime = Date.now();
      const endTime = startTime + 130 * 1000;
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const total = endTime - startTime;
        setProgress((elapsed / total) * 100);
        if (currentTime >= endTime) {
          clearInterval(intervalId);
          setProgress(100);
        }
      }, 100); // update progress every 100 ms

      const response = await fetch("/api/tiplink");
      if (!response.ok) {
        throw new Error("Failed to fetch the TipLink public key");
      }
      setIsTurboSendClicked(true);
      const connection = new Connection("https://api.devnet.solana.com/");
      const topupTx = await elusivInstance.buildTopUpTx(40000000000, "SAMO");
      if (!wallet.signTransaction) {
        throw new Error("wallet.signTransaction is undefined");
      }
      const signedTransaction = await wallet.signTransaction(topupTx.tx);
      signedTransaction.lastValidBlockHeight = (
        await connection.getLatestBlockhash()
      ).lastValidBlockHeight;
      topupTx.tx = signedTransaction;
      const res = await elusivInstance.sendElusivTxWithTracking(topupTx);
      await connection.confirmTransaction(
        {
          signature: res.elusivTxSig.signature,
          lastValidBlockHeight: topupTx.tx.lastValidBlockHeight!,
          blockhash: topupTx.tx.recentBlockhash!,
        },
        "confirmed"
      );
      toast({
        title: "TopUp Complete!",
        description:
          "TopUp Complete! Now performing private send to burner wallet!",
      });
      await delay(30000); // Wait for 10 seconds

      const data = await response.json();
      const buyerPublicKey = new PublicKey(data.tiplinkPublicKey);
      const memo = `${data.tiplinkUrl}`;
      const decryptedTiplink = `${data.decryptedTiplink}`;
      const sendTx = await elusivInstance.buildSendTx(
        20000000000,
        buyerPublicKey,
        "SAMO",
        undefined,
        memo
      );
      const sendRes = await elusivInstance.sendElusivTxWithTracking(sendTx);
      console.log(`Send complete with sig ${sendRes.elusivTxSig}`);
      toast({
        title: "Private Send Complete!",
        description: (
          <ToastWithLink
            message={`Transaction complete and sent to`}
            link={decryptedTiplink}
          />
        ),
      });
      setIsTurboSendClicked(false);
      // After async tasks finish, clear the interval and set progress to 100%
      clearInterval(intervalId);
      setProgress(100);
    } catch (error) {
      if (intervalId) clearInterval(intervalId);
      setProgress(0);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (amount: string, publicKey: string) => {
    setLoading(true);
    toast({
      title: "Send Initiated!",
      description:
        "An Elusiv Private Send has been initiated. Please wait for your transaction to be processed.",
    });

    if (!elusivInstance) return;

    try {
      setProgress(0);
      setIsSendClicked(true);

      const inputPublicKey = new PublicKey(publicKey); // convert provided publicKey to PublicKey object
      const amountInDecimals = parseFloat(amount) * 10 ** 9; // convert amount from Sol to Lamports
      const sendTx = await elusivInstance.buildSendTx(
        amountInDecimals,
        inputPublicKey,
        "SAMO"
      );

      // use sendElusivTxWithTracking() to track the transaction progress
      const { commitmentInsertionPromise, elusivTxSig } =
        await elusivInstance.sendElusivTxWithTracking(sendTx);
      setProgress(50);

      // wait for the commitment to be inserted
      const commitmentInserted = await commitmentInsertionPromise;
      if (commitmentInserted) {
        setProgress(100);
        console.log(`Send complete with sig ${elusivTxSig.signature}`);
        toast({
          title: "Send Complete!",
          description: "Send Complete!",
        });
      } else {
        throw new Error("Commitment insertion failed");
      }
      setIsSendClicked(false);
    } catch (error) {
      setProgress(0);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNoPubKey = async (amount: string) => {
    if (!elusivInstance) return;
    let intervalId: string | number | NodeJS.Timer | undefined;

    try {
      setLoading(true);
      toast({
        title: "Send w/o Pub Key Activated!",
        description:
          "You have requested to send funds without a Public Key. Please wait for 2 minutes to generate a burner keypair and process your transaction!",
      });
      setProgress(0);
      const startTime = Date.now();
      const endTime = startTime + 52 * 1000;
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const total = endTime - startTime;
        setProgress((elapsed / total) * 100);
        if (currentTime >= endTime) {
          clearInterval(intervalId);
          setProgress(100);
        }
      }, 100); // update progress every 100 ms

      setIsSendClicked(true);
      const response = await fetch("/api/tiplink");
      if (!response.ok) {
        throw new Error("Failed to fetch the TipLink public key");
      }
      const data = await response.json();
      const buyerPublicKey = new PublicKey(data.tiplinkPublicKey);
      const memo = `${data.tiplinkUrl}`;
      const decryptedTiplink = `${data.decryptedTiplink}`;
      const amountInDecimals = parseFloat(amount) * 10 ** 9;
      const sendTx = await elusivInstance.buildSendTx(
        amountInDecimals,
        buyerPublicKey,
        "SAMO",
        undefined,
        memo
      );
      const sendRes = await elusivInstance.sendElusivTx(sendTx);
      console.log(`Send complete with sig ${sendRes.signature}`);
      toast({
        title: "Private Send Complete!",
        description: (
          <ToastWithLink
            message={`Send complete with sig ${sendRes.signature} and sent to`}
            link={decryptedTiplink}
          />
        ),
      });
      setIsSendClicked(false);
      clearInterval(intervalId);
      setProgress(100);
    } catch (error) {
      if (intervalId) clearInterval(intervalId);
      setProgress(0);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!elusivInstance) return;

      const last5PrivTxs = await elusivInstance.getPrivateTransactions(
        5,
        "SAMO"
      );
      for (let transaction of last5PrivTxs) {
        const response = await fetch("/api/decrypt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encryptedMemo: (transaction as any).memo }),
        });
        if (response.ok) {
          const data = await response.json();
          // Replace the encrypted memo with the decrypted one
          (transaction as any).memo = data.decryptedMemo;
        }
      }
      setTransactions(last5PrivTxs);
    };

    fetchTransactions();
  }, [elusivInstance]);

  useEffect(() => {
    const fetchUserTokenBalance = async () => {
      try {
        const connection = new Connection(
          "https://api.devnet.solana.com/"
        );
        const usdcMint = new PublicKey(
          "8pjN8CTZ46fJ2sRBGT6wFMU9nAjCoQu9bNQC2SL3R1jZ"
        );
        if (wallet.publicKey) {
          const userTokenAccount = await getAssociatedTokenAddress(
            usdcMint,
            wallet.publicKey
          );
          const accountInfo = await getAccount(connection, userTokenAccount);
          const decimals = 9;
          const divisor = BigInt(10 ** decimals); // for 9 decimal places
          const balanceBigint = BigInt(accountInfo.amount); // your balance as a BigInt

          const beforeDecimal = balanceBigint / divisor; // divide by divisor and convert back to a number
          const afterDecimal = balanceBigint % divisor; // get the remainder (the part after the decimal point)

          // format as a string with two decimal places
          const balanceString = `${beforeDecimal}.${afterDecimal
            .toString()
            .padStart(decimals, "0")}`;
          const balance = parseFloat(balanceString).toFixed(2);
          setUserTokenBalance(balance);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "TokenAccountNotFoundError") {
            toast({
              title: "Account not found",
              description:
                "It looks like you do not have an USDC token account yet. Please create one before proceeding.",
            });
          } else {
            toast({
              title: "Error fetching user balance",
              description:
                "There was an error fetching your USDC balance. Please try again later.",
            });
          }
        }
      }
    };

    // Only fetch the balance if wallet is connected and user is signed in.
    if (wallet.connected && isSignedIn) {
      fetchUserTokenBalance();
    }
  }, [wallet.connected, isSignedIn]); // Added dependencies to useEffect

  useEffect(() => {
    const fetchUserPrivateTokenBalance = async () => {
      setLoading(true);
      try {
        if (!elusivInstance || !wallet.connected || !isSignedIn) return;
        // Inside your fetchTransactions function
        let privateBalance = await elusivInstance.getLatestPrivateBalance(
          "SAMO"
        );
        setUserPrivateTokenBalance(privateBalance.toString());
      } catch (error) {
        toast({
          title: "Error fetching user private balance",
          description:
            "Error fetching user private balance. Do top up your Elusiv Private Balance.",
        });
      }
      setLoading(false);
    };

    // Calling fetchUserPrivate here
    fetchUserPrivateTokenBalance();
  }, [elusivInstance, wallet.connected, isSignedIn, refreshKey]); // Added dependencies to useEffect

  const refreshBalance = () => {
    setRefreshKey((prevKey) => prevKey + 1); // increment the refreshKey by 1
  };

  return (
    <div>
      <Head>
        <title>Monstrè Privacy Dispenser</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
            <MainNav />
            <div className="flex flex-1 items-center justify-end space-x-4">
              {(!wallet.connected || !isSignedIn) && <WalletMultiButton />}
              {wallet.connected && !isSignedIn && (
                <>
                  {/* <Button className="mr-4" onClick={handleSignIn}>
                    Sign Message
                  </Button> */}
                </>
              )}
              {wallet.connected && isSignedIn && (
                <>
                  <WalletMultiButton />
                  <Sheet>
                    <SheetTrigger asChild>
                      {/* <button className="rounded-full overflow-hidden border-1.5 border-black w-9 h-9 flex items-center justify-center">
                        <Image
                          src="/exit.png"
                          alt="sheet"
                          width={18}
                          height={18}
                        />
                      </button> */}
                    </SheetTrigger>
                    <SheetContent position="right" size="full">
                      <SheetHeader>
                        <div className="mx-auto px-4 mt-4 text-center">
                          <SheetTitle>
                            Your Elusiv Private Transaction History
                          </SheetTitle>
                          <SheetDescription>
                            View your recent transaction history, and the links
                            to your burner wallets!
                          </SheetDescription>
                        </div>
                      </SheetHeader>

                      {transactions && transactions.length > 0 && (
                        <Table style={{ width }} className="mx-auto px-4 mt-8">
                          <TableCaption>Your Recent Transactions</TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Transaction Type</TableHead>
                              <TableHead>Memo</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((transaction, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {transaction.txType}
                                </TableCell>
                                <TableCell className="font-medium">
                                  <a
                                    href={(transaction as any).memo}
                                    rel="noopener noreferrer"
                                  >
                                    {(transaction as any).memo}
                                  </a>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {(transaction.amount / 1e9).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      <SheetFooter>
                        <SheetClose asChild>
                          <Button
                            className="mx-auto mt-4 !bg-gray-900 hover:scale-105"
                            onClick={handleSignOut}
                          >
                            Sign Out
                          </Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </>
              )}
            </div>
          </div>
        </header>
        <div
          className={`flex flex-col items-center justify-between p-24 ${inter.className}`}
        >
          <div>
            {isSignedIn && (
              <>
                <div className="grid place-items-center py-4 px-4">
                  <Tabs defaultValue="topup" style={{ width }}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="topup">Top Up</TabsTrigger>
                      <TabsTrigger value="send">Send</TabsTrigger>
                      <TabsTrigger value="turbo">TurboMode</TabsTrigger>
                    </TabsList>
                    <TabsContent value="topup">
                      <Card>
                        <CardHeader>
                          <CardTitle>Top Up</CardTitle>
                          <CardDescription>
                            Top Up Your Elusiv Private Balance.
                          </CardDescription>
                          {wallet.connected &&
                            isSignedIn &&
                            userTokenBalance !== null && (
                              <CardDescription>
                                Your SAMO balance is:{" "}
                                {userTokenBalance.toString()}
                              </CardDescription>
                            )}
                          {loading ? (
                            <div className="flex items-center space-x-4">
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                              </div>
                            </div>
                          ) : (
                            wallet.connected &&
                            isSignedIn &&
                            userPrivateTokenBalance !== null && (
                              <CardDescription>
                                Your SAMO private balance is:{" "}
                                {(
                                  Number(userPrivateTokenBalance) / 1e9
                                ).toFixed(2)}
                              </CardDescription>
                            )
                          )}
                          <Button onClick={refreshBalance} disabled={loading}>
                            Refresh Balance
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Token</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue>
                                  <div className="flex flex-row-2">
                                    <Image
                                      src="/samoyed.png"
                                      alt="Samoyed"
                                      width={20}
                                      height={20}
                                    />
                                    <span className="ml-2">Samoyed</span>
                                  </div>
                                </SelectValue>
                                <SelectContent position="popper">
                                  <SelectItem value="solana">
                                    <div className="flex flex-row-2">
                                      {" "}
                                      <Image
                                        src="/solana.png"
                                        alt="Solana"
                                        width={20}
                                        height={20}
                                      />
                                      <span className="ml-2">Solana</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem
                                    className="flex items-center"
                                    value="bonk"
                                  >
                                    <div className="flex flex-row-2">
                                      <Image
                                        src="/bonk2.png"
                                        alt="Bonk"
                                        width={20}
                                        height={20}
                                      />
                                      <span className="ml-2">Bonk</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </SelectTrigger>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="topupAmount">Amount</Label>
                            <Input
                              id="topupAmount"
                              value={topupAmount}
                              onChange={(e) => setTopupAmount(e.target.value)}
                              placeholder="20 SAMO"
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={handleTopUp} disabled={loading}>
                            Top Up
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    <TabsContent value="send">
                      <Card>
                        <CardHeader>
                          <CardTitle>Send</CardTitle>
                          <CardDescription>
                            Send privately to any public key on Solana.
                          </CardDescription>
                          {wallet.connected &&
                            isSignedIn &&
                            userPrivateTokenBalance !== null && (
                              <CardDescription>
                                Your SAMO private balance is:{" "}
                                {(
                                  Number(userPrivateTokenBalance) / 1e9
                                ).toFixed(2)}
                              </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Token</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue>
                                  <div className="flex flex-row-2">
                                    <Image
                                      src="/samoyed.png"
                                      alt="Samoyed"
                                      width={20}
                                      height={20}
                                    />
                                    <span className="ml-2">Samoyed</span>
                                  </div>
                                </SelectValue>
                                <SelectContent position="popper">
                                  <SelectItem value="solana">
                                    <div className="flex flex-row-2">
                                      {" "}
                                      <Image
                                        src="/solana.png"
                                        alt="Solana"
                                        width={20}
                                        height={20}
                                      />
                                      <span className="ml-2">Solana</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem
                                    className="flex items-center"
                                    value="bonk"
                                  >
                                    <div className="flex flex-row-2">
                                      <Image
                                        src="/bonk2.png"
                                        alt="Bonk"
                                        width={20}
                                        height={20}
                                      />
                                      <span className="ml-2">Bonk</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </SelectTrigger>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                              id="sendAmount"
                              value={sendAmount}
                              onChange={(e) => setSendAmount(e.target.value)}
                              placeholder="20 SAMO"
                            />
                          </div>
                          <div className="flex justify-between items-center py-4">
                            <div>
                              <Label>Generate a Burner Wallet</Label>
                              <CardDescription className="pr-4">
                                Toggle if you do not have a wallet. This will
                                generate a burner wallet on the fly to send your
                                funds to!
                              </CardDescription>
                            </div>
                            <Switch
                              onCheckedChange={(checked) =>
                                setIsSendWoPubKeyEnabled(checked)
                              }
                              checked={isSendWoPubKeyEnabled}
                            />
                          </div>
                          {!isSendWoPubKeyEnabled && (
                            <div className="space-y-1">
                              <Label htmlFor="address">Public Key</Label>
                              <Input
                                id="sendPublicKey"
                                value={sendPublicKey}
                                onChange={(e) =>
                                  setSendPublicKey(e.target.value)
                                }
                                disabled={isSendWoPubKeyEnabled}
                              />
                            </div>
                          )}
                          <div>
                            {isSignedIn && (
                              <Progress
                                value={progress}
                                className={`mt-6 w-[98%] mx-auto ${
                                  isSendClicked ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() =>
                              !loading &&
                              (isSendWoPubKeyEnabled
                                ? handleSendNoPubKey(sendAmount)
                                : handleSend(sendAmount, sendPublicKey))
                            }
                            disabled={loading}
                          >
                            Send
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    <TabsContent value="turbo">
                      <Card>
                        <CardHeader>
                          <CardTitle>Turbo Mode</CardTitle>
                          <CardDescription>
                            Automatically tops-up your Elusiv Private Balance
                            with 40 SAMO and then sends 20 SAMO to a burner
                            wallet that is fully Solana-Pay compatible, all in
                            one interaction.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {isSignedIn && (
                            <Progress
                              value={progress}
                              className={`w-full w-[98%] mx-auto ${
                                isTurboSendClicked ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          )}
                        </CardContent>
                        <CardFooter>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button disabled={loading}>Turbo Send</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  It is recommended to leave funds in your
                                  Elusiv Private Balance for at least 6 hours
                                  before commencing any withdrawal. This is to
                                  ensure maximum privacy. Turbo Send is a
                                  feature that automatically tops-up your Elusiv
                                  Private Balance and withdraws immediately to a
                                  burner wallet.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogAction
                                  onClick={handleTurboSend}
                                  disabled={loading}
                                >
                                  Turbo Send
                                </AlertDialogAction>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-center">
            <Link href="https://elusiv.io/">
              <Image
                src="/elusiv2.png"
                alt="powered by Elusiv"
                width={210}
                height={210}
                className="footer-image"
              />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
