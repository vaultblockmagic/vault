<center><h1>Vault: Uncompromising Asset Security & Account Abstraction</h1></center>

<img src="https://github.com/vaultblockmagic/vault/assets/169519447/58342fc3-96e8-42a3-b29c-31f00892be07" alt="d1" width="48%" style="display: inline-block;"/> <img src="https://github.com/vaultblockmagic/vault/assets/169519447/26d458a9-87ef-496d-a85d-351012bb8b7a" alt="d2" width="48%" style="display: inline-block;"/>
<img src="https://github.com/vaultblockmagic/vault/assets/169519447/560e5a01-28cc-4112-a1a2-2612639b71bc" alt="d3" width="32%" style="display: inline-block;"/> <img src="https://github.com/vaultblockmagic/vault/assets/169519447/d93794fb-0ee3-46ba-a718-342353976389" alt="d4" width="32%" style="display: inline-block;"/> <img src="https://github.com/vaultblockmagic/vault/assets/169519447/ccb5fa99-d939-434c-8362-6af0590af170" alt="d5" width="32%" style="display: inline-block;"/>

## Introduction: A Secure Method for Users & Protocol to Safeguard & Recover Assets With Custom Web2/Web3 MFA
   
As the crypto space evolves, so do the cunning tactics of attackers exploiting vulnerabilities to steal valuable assets. Our team felt this sting first-hand when, just a month before the hackathon, one of our members lost tens of thousands of dollars in an elaborate keyboard clipper attack. With Vault, he could have effortlessly recovered his assets.

Vault was born from the need for unmatched, customizable security for digital assets. By harnessing cutting-edge technologies like custom Web2/Web3 Multi-Factor Authentication (MFA), Zero-Knowledge Proofs (ZKPs), and Account Abstraction, Vault aims to safeguard users' assets, even if their wallets are compromised.

#### Live Demo

The live version of this dApp can be found at https://vault.express

#### Run a local installation of the dApp
Please follow the steps under `/site/client/README.md` to run the dApp locally.

#### Contracts

Please find all relevant documentation perataining to smart contracts under `contracts/README.md`.

#### ZK Circuits
Pleae find all relevant documentation perataining to smart contracts under `circuits/README.md`.

## What it does
#### Some of the core features of Vault:

- **Vault**: Vaulting an asset secures your token within the Vault core smart contract. Users are provided a mirrored asset at a 1:1 rate, and these can be used anywhere else just like your underlying assets that are safely vaulted away.
  
- **Unvaulting**: Unvaulting an asset requires completing any and all security layers applied and exchanging the mirrored assets minted at the time of vaulting to get your original assets back.

- **Lock**: Locking an asset disables all outgoing transfers until unlocked for additional security.
    A user can lock an asset using any combination of the following methods: 
    - **Time**: A user can select a date and time for when the token will be unlocked and transferrable (including infinite).
    - **MFA**: A user can apply a variety of MFA security layers (any number and in any order) which must be performed to unlock the token and make it transferrable.

- **Asset Recovery**: If an asset is vaulted and subsequently compromised or in a lost wallet, a user can use our recovery system to retrieve these assets into a new, secure wallet.

### Chainlink, Gasless EIP-191 Signatures, & Zero Knowledge Proofs

- We leverage Chainlink services to facilitate many of these functionalities. CCIP is used as a cross-chain ENS resolver. Chainlink Functions, with the help of automation and VRF, allow anyone to leverage any Web2 API/Web3 as an MFA source. The primary benefit of Chainlink Automation and VRF is that they demonstrate how an easily verifiable, global, low-cost source of on-chain randomness/entropy can be used for MFA salts and other operations, while the Chainlink Function is used to make an external call to any API and verify the results as needed and checking them with the current global salt, etc. 
- We also demonstrate how EIP-191 Signatures can be used by any Web2/Web3 MFA source to sign a message gaslessly that can be easily verified on chain.
- Zero Knowledge Proofs are integrated to demonstrate a fully on-chain, trustless MFA provider that requires setting a password and proving konwledge of a password through our dApp without revealing sensitive user secrets.
- Any custom MFA logic can be implemented and integrated by simply leveraging our simple IMFA interface.

## How we built it
**1.** Designing the ZKP circuits and smart contract architecture
**2.** Implementing and testing the smart contracts on the Avalanche Fuji testnet and Arbitrum Sepolia testnet
**3.** Creating UI mockups on Figma and building the front-end dApp
**4.** Integrating with MFA providers and testing the security layers
**5.** Conducting thorough testing before deploying

## Challenges we ran into

The first was designing a dApp that neatly packed all the intuitive functions of vaulting, locking, and recovering assets for our users. In the past, we’ve felt UX was our weakest link, and so we wanted to prioritise this. Our approach for this hackathon was simple: design, iterate, be honest, and repeat. We created a style guide and deep-dived into how we wanted things to look and feel. Ultimately, we went through several iterations of both the dApp design and how our landing page would go on to look.

The second, more technical, challenge was acquiring enough testnet funds. Despite having several avenues (Chainlink and Core faucets, for instance), we still found that we were falling short on testnet funds to continue testing as rigorously as we wanted. We have 11 smart contracts and our testing process required multiple redeployments, which was why we required so many tokens. We initially dealt with this by putting each team member on rotation to trigger the faucet when their timed limit was up and then funnelled everything into our testing wallet. Unfortunately, this approach took more time away from us than we would have liked, but regardless, we managed to get the amount that we needed. Towards the end of the hackathon, we were grateful to be invited to a telegram group with AVAX DevRel engineers who helped us fund the rest of our testing efforts.

## Accomplishments that we're proud of
1. **Organized workflow**: The team successfully utilized Trello and a ticketing system to maintain consistency and effectively scope work throughout the project.

2. **Timely delivery**: By consistently meeting deadlines that we set during our sprint-planning sessions, the team avoided the last-minute rush and chaos experienced in previous hackathons.

3. **User-centric**: approach The team prioritized user experience and ensured that the dApp is functional and interactive, going beyond a simple video demo.

4. **Seamless MFA**: integration By integrating with popular MFA providers like Google and Microsoft, users can easily customize their security layers when protecting their assets.

5. **Comprehensive testing**: Because of points 1 and 2, the team had sufficient time to test and ensure the reliability of Vault features.

6. **Chainlink integration**: The team successfully integrated four Chainlink products into the solution (Automation, VRF, CCIP, and Functions).

## What we learned
**1. Meticulous planning and preparation are the cornerstones of success**
 By leveraging powerful tools like Trello and implementing a high-level ticketing system we were able to optimize our workflow. This ensured every team member had a clear understanding of their responsibilities and the project's overall progress.

**2. Efficient communication and collaboration are essential**
 Limiting team meetings to 1-2 times a week struck a perfect balance between staying organized and maximizing productivity. We were able to focus on our tasks at hand while maintaining a cohesive vision for the project.

**3. Trello high-level ticketing system is useful**
 This provided us with effective prioritization of work and maintained transparency throughout the development process. We made a point not to go too granular with these tickets, otherwise, it would take too much time from us during planning sessions. Every team member had a clear picture of accomplishments and where they could contribute their skills, and it ultimately fostered a sense of ownership and accountability.

**4. Setting realistic deadlines and managing time wisely alleviates stress**
 At the end of our last hackathon, our team had to pull all-nighters to finish resulting in an extremely stressed set of final days. We had no intention of repeating history so we decided to push forward the launch deadline and aimed to complete the project a week before the final due date. This allowed the team to maintain sanity and focus on delivering a polished and reliable product.

**5. Streamlining the frontend development process accelerates progress**
 Investing time in creating detailed designs upfront allowed developers to concentrate solely on the implementation. This ultimately eliminated the added burden of designing on the fly, and although this still did happen at times, it was at a component level and much less frequently than we have done in the past. We found this approach ensured a cohesive and visually appealing user experience. These lessons on effective planning, efficient communication, realistic goal-setting, and process optimization will serve as guiding principles for our team as we continue to try and push the boundaries of what is possible in the realm of Web3 data security.

## What's next for Vault
We firmly believe that Vault has the potential to revolutionize asset security in the Web3 ecosystem, offering users an unparalleled level of protection. Our immediate goal following the hackathon is to establish a presence within the Avalanche and Ethereum communities, leveraging the power of Chainlink's services to enhance our protocol's capabilities and interoperability.

One of the most promising applications for Vault lies in Decentralized Finance (DeFi). With the growing popularity of liquid staking and the increasing value locked in DeFi protocols, the need for robust asset security solutions has never been more pressing. We intend to actively engage with DeFi protocols that offer staking services, exploring potential integrations of our vaulting and locking mechanisms into their platforms. By doing so, we aim to provide users with an additional layer of security, ensuring the safety of their staked assets and fostering greater confidence in the DeFi ecosystem as a whole.

In addition to our focus on DeFi, we plan to continue refining the Vault protocol based on user feedback and emerging market needs. This product serves general Web3 users simply trying to protect their assets as well. Our team will dedicate resources to optimizing the user experience, streamlining the asset management process, and introducing new features that enhance the flexibility and usability of our solution.

*We invite all interested parties to follow us and offer feedback as we work towards building a safer and more secure future for digital assets.*
