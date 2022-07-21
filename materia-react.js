class Todo extends React.Component {

    constructor() {
        super();
        this.state = {
            address: null,
            ethersjs: null,
            signer: null,
            connected: false,
            error: null,
            networkId: 4,
            materia: "0x3935e95Cb9Bc72629B13cf09a8d51A6DB488A0f0",
            antonym: "0xB2619C5Ef3aB5cf08DF16Cca56d9Ee335634f90A",
            antonymTokenURI: "https://redemption.fueledonbacon.co/.netlify/functions/metadata-proxy?id",
            materiaContract: null,
            antonymContract: null,
            tokens: null,
            resources: null,
            fetched: false,
            materiaMintable: [],
            materiaPrimaMintable: []
        };
    }

    async componentDidMount() {
        await this.checkMetamaskInstalled()
    }

    async componentDidUpdate(_, prevState, __) {
        const { antonymContract, address, antonymTokenURI, materiaContract } = this.state;
        if (!prevState.antonymContract && antonymContract) {
            const balance = (await antonymContract.balanceOf(address)).toNumber()
            this.setState({ balance })
            if (balance > 0) {
                let tokens = []
                let resources = []
                await Promise.all(new Array(balance).fill(0).map(async (a, i) => {
                    const tokenId = (await antonymContract.tokenOfOwnerByIndex(address, i)).toNumber();
                    tokens.push(tokenId);
                    let fetchRes = await fetchResource(`${antonymTokenURI}=${tokenId}`);
                    fetchRes.tokenId = tokenId;
                    resources.push(fetchRes)
                }))
                //TODO: remove this function for production
                resources = mockRedeemed(resources);

                const skin1of1Tokens = getSkin1of1Tokens();
                if (resources && resources.length > 0) {
                    await Promise.all(resources.map(async r => r.attributes.map(async a => {
                        if (a.value === "Redeemed") {
                            const isAntonymTokenUsed = await materiaContract.isAntonymTokenUsed(r.tokenId);
                            if(isAntonymTokenUsed.toNumber() === 0) {
                                if(skin1of1Tokens.includes(r.tokenId)){
                                    this.setState({materiaPrimaMintable: [...this.state.materiaPrimaMintable, r.tokenId], fetched: true})
                                } else {
                                    this.setState({materiaMintable: [...this.state.materiaMintable, r.tokenId], fetched: true})
                                }
                            }
                        }
                    })))
                }
                this.setState({ tokens, resources })
            }
        }
    }

    async checkMetamaskInstalled() {
        const { ethereum, web3 } = window
        const { networkId } = this.state;
        if (ethereum) {
            const ethersjs = new ethers.providers.Web3Provider(ethereum)
            const netId = (await ethersjs.getNetwork()).chainId
            if (netId !== networkId) return this.setState({ error: `Select ${getNetwork(netId)}` })
            this.setState({ ethersjs })
        } else if (web3) {
            const ethersjs = ethers.providers.Web3Provider(web3.currentProvider)
            const netId = (await ethersjs.getNetwork()).chainId
            if (netId !== networkId) return this.setState({ error: `Select ${getNetwork(netId)}` })
            this.setState({ ethersjs })
        } else {
            this.setState({ error: "Web3 provider not installed" })
        }
    }

    async onConnect() {
        try {
            const enableMetamask = await this.enableWeb3()
            if (enableMetamask) {
                const address = (await this.state.ethersjs.getSigner().getAddress()).toLowerCase()
                this.setState({ address })
                this.initApp()
            } else {
                return this.setState({ error: "Please enable Metamask" })
            }
        } catch (error) {
            this.setState({ error: readError(error) })
        }
    }

    async enableWeb3() {
        const { ethereum, location } = window
        try {
            await ethereum.request({ method: 'eth_requestAccounts' })

            // Subscriptions register
            ethereum.on('accountsChanged', async (accounts) => {
                location.reload()
            })

            ethereum.on('networkChanged', async (network) => {
                location.reload()
            })

            return true
        } catch (error) {
            // The user denied account access
            return false
        }
    }

    async initApp() {
        const { materia, antonym, ethersjs } = this.state

        try {
            const signer = await ethersjs.getSigner();
            const materiaContract = new ethers.Contract(
                materia,
                getMateriaAbi(),
                signer
            );
            const antonymContract = new ethers.Contract(
                antonym,
                getAntonymAbi(),
                signer
            )
            this.setState({ materiaContract, antonymContract })
        } catch (e) {
            this.setState({ error: readError(e) })
        }
    }

    async onMint() {
        const { materiaMintable, materiaPrimaMintable, ethersjs, materiaContract, address } = this.state;
        const tokens = [...materiaMintable, ...materiaPrimaMintable].sort((a, b) => a -b)

        try {
            const sig = await getSignature(ethersjs, materiaContract, tokens, address);
            console.log(sig)
            console.log(tokens.map(t => ethers.BigNumber.from(t)))
            let tx = await materiaContract.mint(tokens, sig);
            tx = await tx.wait()
            console.log(tx)
        } catch(e) {
            this.setState({error: readError(e)})
        }
        
        
    }

    renderError() {
        const { error } = this.state;
        if (this.state.error) {
            return <div>{error}</div>
        }
    }

    renderMintTokens() {
        const { materiaMintable, materiaPrimaMintable } = this.state;
        if(materiaMintable.length === 0 && materiaPrimaMintable.length === 0) return null

        return(
            <div>
                {
                    materiaMintable.length > 0 ? (
                        <div><small>Mint {materiaMintable.length} Materia Tokens</small></div>
                    ) : null
                }
                {
                    materiaPrimaMintable.length > 0 ? (
                        <div><small>Mint {materiaPrimaMintable.length} Prima Materia Tokens</small></div>
                    ) : null
                }
                <a href="#" className="claim_button w-inline-block" onClick={() => this.onMint()}>
                    <div id="connect-claim" className="claim_button_text">MINT</div>
                </a>
                {this.renderError()}
            </div>
        )
    }

    render() {
        const { address, materiaContract, materiaMintable, materiaPrimaMintable, fetched } = this.state;

        return (
            <div>
                <div>{!materiaContract && address? <div>Unable to load MateriaContract</div> : null}</div>
                <div>{address && materiaContract && (materiaMintable.length > 0 || materiaPrimaMintable.length > 0) ? this.renderMintTokens() : fetched ? <div>No Materia To Mint</div> : null}</div>
                <div>{address === null ? (
                        <div>
                            <a href="#" className="claim_button w-inline-block" onClick={() => this.onConnect()}>
                                <div id="connect-claim" className="claim_button_text">CONNECT</div>
                            </a>
                            <text className="wallet_ui">NO WALLET DETECTED</text>
                            {this.renderError()}
                        </div>
                        ): !fetched ? (
                            <div>
                                <a href="#" className="claim_button w-inline-block" >
                                    <div id="connect-claim" className="claim_button_text">LOADING</div>
                                </a>
                            </div>
                        ): <text className="wallet_ui">{address}</text>
                    }
                </div>
            </div>
        )
    }
};

ReactDOM.render(<Todo />, document.getElementById('app'));

async function fetchResource(url) {
    try {
        let res = await fetch(url)
        res = await res.json()
        return res
    } catch (e) {
        console.log(e)
    }
}

function mockRedeemed(resources) {
    const size = resources.length;
    let rand = Math.floor(Math.random() * size);
    if(rand === 0) rand = 1
    for(let j = 0; j < rand; j++) {
      let arrayRand = Math.floor(Math.random() * size);
      resources[arrayRand].attributes[1].value = "Redeemed";
    }
  return resources;
}

async function getSignature(provider, materia, tokens, address) {
    const privateKey = "af82397882dc0330cb648a577330dcfd80e996e29f800dfd1db3905d4b478dd4"
    const signer = new ethers.Wallet(privateKey, provider);
    let messageHash = await materia.messageHash(address, tokens);
    let signature = signer.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
}