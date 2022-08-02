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
            materia: "0x65dDF3952AEFbe94e223715caC15f5C86bAe9F5a",
            antonym: "0xA0B69178DDc67E8870C39Ea8589b2A8dBf28CBD2",
            antonymTokenURI: "https://redemption.fueledonbacon.co/.netlify/functions/metadata-proxy?id",
            materiaContract: null,
            antonymContract: null,
            tokens: null,
            resources: null,
            fetched: false,
            materiaMintable: [],
            materiaPrimaMintable: [],
            materiaMinted: null,
            materiaPrimaMinted: null,
            minting: false,
            toMint: null
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
                                    this.setState({materiaPrimaMintable: [...this.state.materiaPrimaMintable, r.tokenId]})
                                } else {
                                    this.setState({materiaMintable: [...this.state.materiaMintable, r.tokenId]})
                                }
                            }
                        }
                    })))
                }
                if(resources && resources.length > 0) {
                    const found = resources.map(async r => r.attributes.map(async a => a.value === "Redeemed"))
                    console.log(found)
                }
                this.setState({ tokens, resources, fetched: true })
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
        const { materiaMintable, materiaPrimaMintable, materiaContract, address, fetched, minting } = this.state;
        if(!fetched || minting) return;
        const tokens = [...materiaMintable, ...materiaPrimaMintable].sort((a, b) => a -b)

        try {
            this.setState({fetched: false, minting: true, error: null})
            const sig = await getSignature(tokens, address);
            let tx = await materiaContract.mint(tokens, sig);
            tx = await tx.wait()
            this.setState({fetched: true})
            const events = tx.events.filter(e => e.event === "TransferSingle").map(e => e.args).map(e => {
                return {
                    tokenId: e[3].toNumber(),
                    amount: e[4].toNumber()
                }
            })
            events.map(e => {
                if(e.tokenId === 1) this.setState({materiaMinted: e.amount})
                if(e.tokenId === 2) this.setState({materiaPrimaMinted: e.amount})
            })
        } catch(e) {
            this.setState({error: readError(e), minting: false, fetched: true})
        }
        
        
    }

    renderError() {
        const { error } = this.state;
        if (this.state.error) {
            return <div>{error}</div>
        }
    }

    renderMintTokens() {
        const { materiaMintable, materiaPrimaMintable, materiaMinted, materiaPrimaMinted, minting } = this.state;
        if(materiaMintable.length === 0 && materiaPrimaMintable.length === 0) return null

        return(
            <div>
                {
                    materiaMinted ? <div><small>Minted {materiaMinted} Materia Tokens</small></div> : null
                }
                {
                    materiaPrimaMinted ? <div><small>Minted {materiaPrimaMinted} Prima Materia Tokens</small></div> : null
                }
                {
                    materiaMintable.length > 0 && !materiaMinted && !materiaPrimaMinted ? (
                        <div><small>Mint {materiaMintable.length} Materia Tokens</small></div>
                    ) : null
                }
                {
                    materiaPrimaMintable.length > 0 && !materiaMinted && !materiaPrimaMinted ? (
                        <div><small>Mint {materiaPrimaMintable.length} Prima Materia Tokens</small></div>
                    ) : null
                }
                {
                    materiaPrimaMinted || materiaMinted || minting ? null : (
                        <a href="#" className="claim_button w-inline-block" onClick={() => this.onMint()}>
                            <div id="connect-claim" className="claim_button_text">MINT</div>
                        </a>
                    )
                }
                
                {this.renderError()}
            </div>
        )
    }

    render() {
        const { address, materiaContract, materiaMintable, materiaPrimaMintable, fetched, toMint } = this.state;

        return (
            <div>
                <div>{!materiaContract && address? <div>Unable to load MateriaContract</div> : null}</div>
                <div>{address && materiaContract && (materiaMintable.length > 0 || materiaPrimaMintable.length > 0) ? 
                    this.renderMintTokens() : 
                    toMint === 0 ? 
                        <div>No Materia To Mint</div> : 
                        null
                    }
                </div>
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
                        ): null
                    }
                    {
                        address !== null ? <text className="wallet_ui">{address}</text> : null
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

async function getSignature(tokens, address) {

    try {
        const req = await fetch('https://redemption.fueledonbacon.co/.netlify/functions/materia-redemption', {
            method: 'POST',
            body: JSON.stringify({tokens, address})
        })
        const content = await req.json();
        return content.signature
    } catch(e) {
        throw(e)
    }
    
}