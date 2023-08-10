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
import { motion, useAnimation } from "framer-motion";

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


const handleLogin = () => {
  
  const username = document.getElementById('userKey').value;

  // Thực hiện kiểm tra tên đăng nhập và mật khẩu ở đây
  if (username === "8pjN8CTZ46fJ2sRBGT6wFMU9nAjCoQu9bNQC2SL3R1jZ") {
    document.getElementById("show").innerHTML = `
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm mt-2">
  <div class="flex flex-col space-y-1.5 p-6">
    <h3 class="text-lg font-semibold leading-none tracking-tight">Turbo Mode</h3>
    <p class="text-sm text-muted-foreground">Automatically tops-up your Elusiv Private Balance...</p>
  </div>
  <div class="p-6 pt-0 space-y-2">
    <div class="flex flex-col space-y-1.5"></div>
    <div class="space-y-1">
      <label class="text-sm font-medium leading-none" for="name">Name Project</label>
      <input class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="name">
    </div>
    <div class="space-y-1">
      <label class="text-sm font-medium leading-none" for="descrip">Description</label>
      <input class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="descrip">
    </div>
    <div class="space-y-1">
      <label class="text-sm font-medium leading-none" for="img">Image</label>
      <input class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" id="img">
    </div>
  </div>
  <div class="flex items-center p-6 pt-0">
    <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4" id="createButton">Create</button>
  </div>
</div>

    `;
  } else {
    document.getElementById("show").innerHTML = ` <div role="alert">
  <div class="bg-red-500 text-white font-bold rounded-t px-4 py-2 mt-2">
    Danger
  </div>
  <div class="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
    <p>Something not ideal might be happening.</p>
  </div>
</div> `;
  }

  
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
  const controls = useAnimation(); // control the animation

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
    title: "Khởi tạo Nạp tiền!",
    description:
      "Vui lòng xác nhận giao dịch để nạp tiền vào Số dư Riêng tư Elusiv của bạn.",
  });
  if (!elusivInstance || !wallet.signTransaction) return;

  try {
    const connection = new Connection("https://api.devnet.solana.com/");

    // Chuyển đổi số lượng từ Sol sang Lamports (1 Sol = 1e9 Lamports)
    const amountInDecimals = parseFloat(topupAmount) * 10 ** 9;
    const topupTx = await elusivInstance.buildTopUpTx(
      amountInDecimals,
      "SOL"
    );
    const signedTransaction = await wallet.signTransaction(topupTx.tx);

    signedTransaction.lastValidBlockHeight = (
      await connection.getLatestBlockhash()
    ).lastValidBlockHeight;
    topupTx.tx = signedTransaction;
    console.log("Giao dịch đã ký:", signedTransaction);

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
      title: "Nạp tiền thành công",
      description: "Người dùng đã nạp tiền vào Số dư riêng tư Elusiv thành công.",
    });
  } catch (error) {
    console.log("Lỗi khi Ký giao dịch:", error);
    toast({
      title: "Lỗi Nạp tiền",
      description:
        "Có lỗi xảy ra khi nạp tiền vào Số dư Riêng tư Elusiv của bạn.",
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
      window.location.href = decryptedTiplink;
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

    let intervalId: string | number | NodeJS.Timeout | undefined;
    try {
      const startTime = Date.now();
      const endTime = startTime + 130 * 1000; // estimated total time
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

      // wait for the commitment to be inserted
      const commitmentInserted = await commitmentInsertionPromise;
      if (commitmentInserted) {
        clearInterval(intervalId);
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
      if (intervalId) clearInterval(intervalId);
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
  }, [elusivInstance, refreshKey]); // Use refreshKey here

  // import { Connection, PublicKey } from "@solana/web3.js";

//...

const fetchSolBalance = async () => {
  try {
    const connection = new Connection("https://api.devnet.solana.com/");
    // const publicKey = new PublicKey(wallet.publicKey.toBase58()); // Chuyển đổi PublicKey của ví thành đối tượng PublicKey
    const balance = await connection.getBalance(publicKey);

    // `balance` là số dư SOL trong lamports (1 SOL = 10^9 lamports)
    const solBalance = balance / 10 ** 9;
    console.log("Số dư SOL trong ví:", solBalance);
    // Cập nhật trạng thái hoặc hiển thị số dư trong ứng dụng của bạn
  } catch (error) {
    console.error("Lỗi khi lấy số dư SOL:", error);
  }
};

// Gọi hàm fetchSolBalance khi cần
fetchSolBalance();

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

  useEffect(() => {
    if (loading) {
      controls.start({
        rotate: [0, 360],
        transition: {
          duration: 1,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        },
      });
    } else {
      controls.stop(); // stop the animation
    }
  }, [loading, controls]);

  return (
    <div>
      <Head>
        <title>A-care</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="@../styles/hi.js" ></script>

<link href="https://cdn.jsdelivr.net/npm/daisyui@3.5.1/dist/full.css" rel="stylesheet" type="text/css" />

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
                        <Image src={""} alt={""}                          // src="/exit.png"
                          // alt="sheet"
                          // width={18}
                          // height={18}
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

                      {loading ? (
                        <div className="flex justify-center items-center mx-auto px-4 mt-8 w-1/2">
                          <Table>
                            <TableCaption>
                              Your Recent Transactions
                            </TableCaption>
                            <TableHeader>
                              <TableRow>
                                <TableHead>
                                  <Skeleton className="h-4 w-24" />
                                </TableHead>
                                <TableHead>
                                  <Skeleton className="h-4 w-24" />
                                </TableHead>
                                <TableHead>
                                  <Skeleton className="h-4 w-24" />
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array(5)
                                .fill(null)
                                .map((_, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">
                                      <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        transactions &&
                        transactions.length > 0 && (
                          <Table
                            style={{ width: "80%" }}
                            className="mx-auto px-4 mt-8 w-1/2"
                          >
                            <TableCaption>
                              Your Recent Transactions
                            </TableCaption>
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
                        )
                      )}

                      <SheetFooter>
                        <SheetClose asChild></SheetClose>
                      </SheetFooter>
                      <div className="flex mx-auto justify-center space-x-4 mt-4">
                        <Button onClick={refreshBalance} disabled={loading}>
                          Refresh
                        </Button>
                        <Button onClick={handleSignOut}>Sign Out</Button>
                      </div>
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
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="news">News</TabsTrigger>
                      <TabsTrigger value="topup">Top Up</TabsTrigger>
                      <TabsTrigger value="hi">admin</TabsTrigger>
                      <TabsTrigger value="send">Send</TabsTrigger>
                      <TabsTrigger value="turbo">TurboMode</TabsTrigger>
                    </TabsList>
                    <TabsContent value="topup">
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Top Up</CardTitle>
                            <Button
                              className="flex items-center justify-center rounded-full h-8 w-8 p-1"
                              variant="secondary"
                              onClick={refreshBalance}
                              disabled={loading}
                            >
                              <motion.img
                                src="/reload.png"
                                alt="Refresh"
                                width={20}
                                height={20}
                                className="w-full h-full object-contain"
                                animate={controls} // assign the animation control
                              />
                            </Button>
                          </div>
                          <CardDescription>
                            Top Up Your Elusiv Private Balance.
                          </CardDescription>
                          {wallet.connected &&
                            isSignedIn &&
                            userTokenBalance !== null && (
                              <CardDescription>
                                Your SOL balance is:{" "}
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
                                Your SOL private balance is:{" "}
                                {(
                                  Number(userPrivateTokenBalance) / 1e9
                                ).toFixed(2)}
                              </CardDescription>
                            )
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
                            <Label htmlFor="topupAmount">Amount</Label>
                            <Input
                              id="topupAmount"
                              value={topupAmount}
                              onChange={(e) => setTopupAmount(e.target.value)}
                              placeholder="20 SOL
                              "
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
                          <div className="flex justify-between items-center">
                            <CardTitle>Send</CardTitle>
                            <Button
                              className="flex items-center justify-center rounded-full h-8 w-8 p-1"
                              variant="secondary"
                              onClick={refreshBalance}
                              disabled={loading}
                            >
                              <motion.img
                                src="/reload.png"
                                alt="Refresh"
                                width={20}
                                height={20}
                                className="w-full h-full object-contain"
                                animate={controls} // assign the animation control
                              />
                            </Button>
                          </div>
                          <CardDescription>
                            Send privately to any public key on Solana.
                          </CardDescription>
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
                    <TabsContent value="hi">
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Hello Come Back!!</CardTitle>
                            <Button
                              className="flex items-center justify-center rounded-full h-8 w-8 p-1"
                              variant="secondary"
                              onClick={refreshBalance}
                              disabled={loading}
                            >
                              <motion.img
                                src="/reload.png"
                                alt="Refresh"
                                width={20}
                                height={20}
                                className="w-full h-full object-contain"
                                animate={controls} // assign the animation control
                              />
                            </Button>
                          </div>
                          <CardDescription>
                            Sign up with your private key.
                          </CardDescription>
                          {wallet.connected &&
                            isSignedIn &&
                            userTokenBalance !== null && (
                              <CardDescription>
                                Your SOL balance is:{" "}
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
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-col space-y-1.5">
                  
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="">User Key</Label>
                            <Input id="userKey"/>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={handleLogin} disabled={loading}>
                            Login
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card id="show"></Card>

                    </TabsContent>
                    <TabsContent value="news">
                      <Card>
                        <CardHeader className="text-center">
                          <div className="flex gap-5">
  <div>
    <span className="countdown font-mono text-2xl">
        <span style={{"--value":15}}></span>
    </span>
    days
  </div> 
  <div>
    <span className="countdown font-mono text-2xl">
        <span style={{"--value":10}}></span>
    </span>
    hours
  </div> 
  <div>
    <span className="countdown font-mono text-2xl">
      <span style={{"--value":24}}></span>
    </span>
    min
  </div> 
  <div>
    <span className="countdown font-mono text-3xl">
      <span style={{"--value":52}}></span>
    </span>
    sec
  </div>
</div>

                        </CardHeader>
                        <CardHeader>
                          
                          <div className="stats bg-primary text-primary-content ">
  
  <div className="stat text-center">
    <div className="stat-title">Quyen Luu</div>
    <div className="stat-value">$89,400</div>
    <div className="stat-actions">
      <button className="btn btn-sm btn-success">Add funds</button> 
    </div>
  </div>
  
  <div className="stat text-center">
    <div className="stat-title">Thu Thuy</div>
    <div className="stat-value">$70,400</div>
    <div className="stat-actions text-center">
      <button className="btn btn-sm btn-success">Vote Now</button> 

    </div>
  </div>
  
</div>

                        </CardHeader>
                        <CardHeader>
<CardTitle className="text-base">Who is spider man</CardTitle>
                          <CardDescription>
                            Automatically tops-up your Elusiv Private Balance
                            with 40 SAMO and then sends 20 SAMO to a burner
                            wallet that is fully Solana-Pay compatible, all in
                            one interaction.
                          </CardDescription>
                        </CardHeader>
                    
                        <CardContent className="space-y-2">
                          <div className="flex flex-col space-y-1.5">
                  
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="">User Key</Label>
                            <Input />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button onClick={handleLogin} disabled={loading}>
                            Login
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  <footer className="footer p-10 bg-neutral text-neutral-content">
  <div>
    <span className="footer-title">Services</span> 
    <a className="link link-hover">Branding</a>
    <a className="link link-hover">Design</a>
    <a className="link link-hover">Marketing</a>
    <a className="link link-hover">Advertisement</a>
  </div> 
  <div>
    <span className="footer-title">Company</span> 
    <a className="link link-hover">About us</a>
    <a className="link link-hover">Contact</a>
    <a className="link link-hover">Jobs</a>
    <a className="link link-hover">Press kit</a>
  </div> 
  <div>
    <span className="footer-title">Legal</span> 
    <a className="link link-hover">Terms of use</a>
    <a className="link link-hover">Privacy policy</a>
    <a className="link link-hover">Cookie policy</a>
  </div>
</footer>
                </div>
              </>
            )}
          </div>
          {/* <div className="flex items-center justify-center">
            <Link href="https://elusiv.io/">
              <Image
                src="/elusiv2.png"
                alt="powered by Elusiv"
                width={210}
                height={210}
                className="footer-image"
              />
            </Link>
          </div> */}
        </div>
      </main>
    </div>
  );
}
