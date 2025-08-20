package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/davecgh/go-spew/spew"
	"github.com/ethereum/go-ethereum/cmd/utils"
	"github.com/spf13/cobra"
	"github.com/web3coach/the-blockchain-bar/wallet"
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
	walletCmd.AddCommand(walletPkPrintCmd())

	return walletCmd
}

func walletNewAccountCmd() *cobra.Command {
	var cmd = &cobra.Command{
		Use:   "new-account",
		Short: "Creates a new account with a new set of a elliptic-curve Private + Public keys.",
		Run: func(cmd *cobra.Command, args []string) {
			password := getPassPhrase("Please enter a password to encrypt the new wallet:", true)
			dataDir := getDataDirFromCmd(cmd)

			acc, err := wallet.NewKeystoreAccount(dataDir, password)
			if err != nil {
				fmt.Println(err)
				os.Exit(1)
			}

			fmt.Printf("New account created: %s\n", acc.Hex())
		},
	}

	addDefaultRequiredFlags(cmd)

	return cmd
}

func walletPkPrintCmd() *cobra.Command {
	var keystorePath string

	var cmd = &cobra.Command{
		Use:   "pk-print",
		Short: "Print private key from keystore file.",
		Run: func(cmd *cobra.Command, args []string) {
			if keystorePath == "" {
				fmt.Println("Error: --keystore flag is required")
				os.Exit(1)
			}

			password := getPassPhrase("Please enter the password for the keystore:", false)

			// Read keystore file
			keystoreData, err := os.ReadFile(keystorePath)
			if err != nil {
				fmt.Printf("Error reading keystore file: %v\n", err)
				os.Exit(1)
			}

			// Decrypt the private key
			key, err := wallet.DecryptKeystore(keystoreData, password)
			if err != nil {
				fmt.Printf("Error decrypting keystore: %v\n", err)
				os.Exit(1)
			}

			spew.Dump(key)
		},
	}

	cmd.Flags().StringVar(&keystorePath, "keystore", "", "Path to keystore file")
	cmd.MarkFlagRequired("keystore")

	return cmd
}

func getPassPhrase(prompt string, confirmation bool) string {
	fmt.Println(prompt)
	fmt.Print("Password: ")

	reader := bufio.NewReader(os.Stdin)
	password, err := reader.ReadString('\n')
	if err != nil {
		utils.Fatalf("Failed to read password: %v", err)
	}
	password = strings.TrimSpace(password)

	if confirmation {
		fmt.Print("Repeat password: ")
		confirm, err := reader.ReadString('\n')
		if err != nil {
			utils.Fatalf("Failed to read password confirmation: %v", err)
		}
		confirm = strings.TrimSpace(confirm)
		if password != confirm {
			utils.Fatalf("Passwords do not match")
		}
	}

	return password
}
