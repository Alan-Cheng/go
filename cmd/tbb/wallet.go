package main

import (
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/keystore"
	"github.com/ethereum/go-ethereum/cmd/utils"
	"github.com/spf13/cobra"
	"github.com/web3coach/the-blockchain-bar/wallet"
	"os"
	"syscall"
)

func walletCmd() *cobra.Command {
	var walletCmd = &cobra.Command{
		Use:   "wallet",
		Short: "Manages accounts, keys, cryptography.",
		PreRunE: func(cmd *cobra.Command, args []string) error {
			return incorrectUsageErr()
		},
		Run: func(cmd *cobra.Command, args []string) {
		},
	}

	walletCmd.AddCommand(walletNewAccountCmd())

	return walletCmd
}

func walletNewAccountCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "new-account",
		Short: "Creates a new account with a new set of a elliptic-curve Private + Public keys.",
		Run: func(cmd *cobra.Command, args []string) {
			password := getPassPhrase("Please enter a password to encrypt the new wallet:", true)

			dataDir := getDataDirFromCmd(cmd)

			ks := keystore.NewKeyStore(wallet.GetKeystoreDirPath(dataDir), keystore.StandardScryptN, keystore.StandardScryptP)
			acc, err := ks.NewAccount(password)
			if err != nil {
				fmt.Println(err)
				os.Exit(1)
			}

			fmt.Printf("New account created: %s\n", acc.Address.Hex())
		},
	}

	addDefaultRequiredFlags(cmd)

	return cmd
}

func getPassPhrase(prompt string, confirmation bool) string {
	fmt.Println(prompt)
	fmt.Print("Password: ")

	var password string
	fmt.Scanln(&password)

	if confirmation {
		fmt.Print("Repeat password: ")
		var confirm string
		fmt.Scanln(&confirm)

		if password != confirm {
			fmt.Println("Passwords do not match")
			os.Exit(1)
		}
	}

	return password
}

