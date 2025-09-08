"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Wallet,
} from "lucide-react";
import { usePayment } from "@/hooks/use-payment";
import { useContract } from "@/contexts/contract-context";
import { useEffect } from "react";

export function PaymentStatus() {
  const { account } = useContract();
  const {
    balance,
    contractBalance,
    loading,
    error,
    paymentStatus,
    checkBalance,
    checkContractBalance,
    getTransactionUrl,
  } = usePayment();

  useEffect(() => {
    if (account) {
      checkBalance(account);
      checkContractBalance();
    }
  }, [account, checkBalance, checkContractBalance]);

  return (
    <div className="space-y-4">
      {/* Balance Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number.parseFloat(balance).toFixed(4)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Available for transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contract Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number.parseFloat(contractBalance).toFixed(4)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Total platform revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status */}
      {(paymentStatus.isPending ||
        paymentStatus.isSuccess ||
        paymentStatus.isError) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {paymentStatus.isPending && (
                <Clock className="h-5 w-5 text-blue-500" />
              )}
              {paymentStatus.isSuccess && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {paymentStatus.isError && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Transaction Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  paymentStatus.isPending
                    ? "secondary"
                    : paymentStatus.isSuccess
                    ? "default"
                    : "destructive"
                }
              >
                {paymentStatus.isPending
                  ? "Pending"
                  : paymentStatus.isSuccess
                  ? "Success"
                  : "Failed"}
              </Badge>
            </div>

            {paymentStatus.isPending && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Transaction is being processed...
                </p>
                <Progress value={50} className="h-2" />
              </div>
            )}

            {paymentStatus.isError && paymentStatus.error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive">
                  {paymentStatus.error}
                </AlertDescription>
              </Alert>
            )}

            {paymentStatus.receipt && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Block Number</p>
                    <p className="font-mono">
                      {paymentStatus.receipt.blockNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gas Used</p>
                    <p className="font-mono">
                      {paymentStatus.receipt.gasUsed.toString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      getTransactionUrl(paymentStatus.receipt!.hash),
                      "_blank"
                    )
                  }
                  className="w-full"
                >
                  View on Etherscan
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
