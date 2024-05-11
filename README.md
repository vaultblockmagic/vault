## Inspiration:

One-liner: **A Secure Method for Users and Protocols to Safeguard & Recover Assets with Zero Knowledge Proofs**

As the crypto space matures, attackers are finding new ways to exploit vulnerabilities and steal assets. 

Our team has experienced this first-hand. Nearly one month prior to the hackathon starting, one of our team members was exposed to an elaborate keyboard clipper attack that almost cost them tens of thousands of dollars in digital assets. If they had access to Vault, they could have recovered their assets stress-free.

Vault was born from the need for unmatched, customizable security for digital assets. By harnessing cutting-edge technologies like Zero-Knowledge Proofs (ZKPs) and Account Abstraction, Vault aims to safeguard users' assets, even if their wallets are compromised.

## What it does
#### Some of the core features of Vault:

- **Vault**: Vaulting an asset secures your token within the Vault core smart contract. Users are provided with a mirrored asset at a 1:1 rate, and these can be used anywhere in Web3, such as staking, DeFi, and trading, whilst the underlying asset remains securely vaulted in the smart contract.
  
- **Unvault**: Unvaulting an asset requires the completion of the zero knowledge proof verification as well as the exchange of the mirrored assets minted at the time of vaulting.

- **Lock**: Locking an asset disables all outgoing transfers until unlocked. A user can lock an asset using the following method:
    - **Time**: A user can select a date and time for when the token will be unlocked and transferrable.

- **Asset Recovery**: If an asset is vaulted and subsequently compromised or in a lost wallet, a user can use our account system to retrieve these assets into a new, secure wallet.

### Zero Knowledge Proofs

- Zero Knowledge Proofs are integrated to demonstrate a fully on-chain, trustless verification method that requires setting a password and proving knowledge of a password through our dApp without revealing sensitive user secrets.

## How we built it
1. Designing the ZKP circuits and smart contract architecture

2. Implementing and testing the smart contracts on the Arbitrum Sepolia testnet

3. Creating UI mockups on Figma and building the front-end dApp

4. Integrating ZKP verification and testing the security layers

5. Conducting thorough testing before deploying

## Challenges we ran into
Our team faced two core challenges during the hackathon.

The first was designing a dApp that neatly packed all the intuitive functions of vaulting, locking, and recovering assets for our users. In the past, we've felt UX was our weakest link, and so we wanted to prioritise this. Our approach for this hackathon was simple: design, iterate, be honest, and repeat. We created a style guide and deep-dived into how we wanted things to look and feel. Ultimately, we went through several iterations of both the dApp design and how our landing page would go on to look.

The second, more technical, challenge was acquiring enough testnet funds. Despite having several avenues (Chainlink and Core faucets, for instance), we still found that we were falling short on testnet funds to continue testing as rigorously as we wanted. We have 11 smart contracts and our testing process required multiple redeployments, so we required so many tokens. We initially dealt with this by putting each team member on rotation to trigger the faucet when their timed limit was up and then funnelled everything into our testing wallet. Unfortunately, this approach took more time away from us than we would have liked, but regardless, we managed to get the amount that we needed. Towards the end of the hackathon, we were grateful to be invited to a telegram group with AVAX DevRel engineers who helped us fund the rest of our testing efforts.

## Accomplishments that we're proud of
**1. User-centric approach** 
The team prioritised user experience and ensured that the dApp was functional and interactive, and could be used as a working product beyond just a simple demo/proof of concept.

**2. Organised workflow**
The team successfully utilized Trello and a ticketing system to maintain consistency and effectively scope work throughout the project.

**3. Timely delivery**
By consistently meeting deadlines that we set during our sprint-planning sessions, the team avoided the last-minute rush and chaos experienced in previous hackathons.

**4. Comprehensive testing** 
Because of points 2 and 3, the team had sufficient time to test and ensure the reliability of Vault features.

## What we learned
**1. Meticulous planning and preparation are the cornerstones of success**
 By leveraging powerful tools like Trello and implementing a high-level ticketing system we were able to optimize our workflow. This ensured every team member had a clear understanding of their responsibilities and the project's overall progress

**2. Efficient communication and collaboration are essential**
 Limiting team meetings to 1-2 times a week struck a perfect balance between staying organized and maximizing productivity. We were able to focus on our tasks at hand while maintaining a cohesive vision for the project.

**3. Trello high-level ticketing system is useful**
 Enabled effective prioritization of work and maintained transparency throughout the development process. We made a point not to go too granular with these tickets, otherwise, it would take too much time from us during planning sessions. Every team member had a clear picture of accomplishments and where they could contribute their skills and it ultimately fostered a sense of ownership and accountability.

**4. Setting realistic deadlines and managing time wisely alleviates stress**
 At the end of our last hackathon, our team had to pull all-nighters and was extremely stressed. We had no intention of repeating history so we decided to push forward the launch deadline and aimed to complete the project a week before the final due date. This allowed the team to maintain sanity and focus on delivering a polished and reliable product.

**5. Streamlining the frontend development process accelerates progress**
 Investing time in creating detailed designs upfront allowed developers to concentrate solely on the implementation. This ultimately eliminated the added burden of designing on the fly, although this did happen at times, it was at a component level and much less frequently than we have done in the past. We found this approach ensured a cohesive and visually appealing user experience. These lessons on effective planning, efficient communication, realistic goal-setting, and process optimization will serve as guiding principles for our team as we continue to try and push the boundaries of what is possible in the realm of zero-knowledge proofs and data security.

## What's next for Vault
We firmly believe that Vault has the potential to revolutionize asset security in the Web3 ecosystem, offering users an unparalleled level of protection using zero knowledge proofs. Our immediate goal following the hackathon is to establish a presence within the Avalanche and Ethereum communities.

One of the most promising applications for Vault lies in Decentralized Finance (DeFi). With the growing popularity of liquid staking and the increasing value locked in DeFi protocols, the need for robust asset security solutions has never been more pressing. We intend to actively engage with DeFi protocols that offer staking services, exploring potential integrations of our vaulting and locking mechanisms into their platforms. By doing so, we aim to provide users with an additional layer of security, ensuring the safety of their staked assets and fostering greater confidence in the DeFi ecosystem as a whole.

In addition to our focus on DeFi, we plan to continue refining the Vault protocol based on user feedback and emerging market needs. This product also serves general Web3 users who are simply trying to protect their assets. Our team will dedicate resources to optimising the user experience, streamlining the asset management process, and introducing new features that enhance the flexibility and usability of our solution.