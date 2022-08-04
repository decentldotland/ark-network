use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::{env, near_bindgen, AccountId};
pub use crate::events::*;
mod events;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct IdentityLinker {
    identities: LookupMap<AccountId, String>,
    paused: bool,
    ark_network: String,
}

fn check_ar_addr_len(arweave_addr: String) -> bool {
    let address_len = arweave_addr.chars().count();
    let arweave_address_max = 43;
    if arweave_address_max == address_len {
        return true;
    } else {
        near_sdk::env::panic_str("Invalid Arweave address");
    }
}

impl Default for IdentityLinker {
    fn default() -> Self {
        Self {
            identities: LookupMap::new(Vec::new()),
            paused: true,
            ark_network: "NEAR-MAINNET".to_string(),
        }
    }
}

#[near_bindgen]
impl IdentityLinker {
    pub fn set_id(&mut self, arweave_addr: String) {
        if self.paused == false {
            let account_id = env::signer_account_id();
            let _address = String::from(&arweave_addr);
            if check_ar_addr_len(_address) && !self.paused {
                self.identities.insert(&account_id, &arweave_addr);
                let identity_log: EventLog = EventLog {
                    event: EventLogVariant::ArkIdentityLinked(vec![ArkIdentityLinkedLog {
                        address: arweave_addr,
                    }])
                };
                env::log_str(&identity_log.to_string());
            } else {
                near_sdk::env::panic_str("Unauthorized attempt to link");
            }
        }
    }

    pub fn get_id(&self, account_id: AccountId) -> Option<String> {
        return self.identities.get(&account_id);
    }

    pub fn get_pause_state(&self) -> bool {
        return self.paused;
    }

    pub fn toggle_pause(&mut self) {
        let owner = String::from(near_sdk::env::current_account_id());
        let caller = String::from(near_sdk::env::predecessor_account_id());
        if caller == owner {
            self.paused = !self.paused;
        } else {
            near_sdk::env::panic_str("Caller is not authorized to pause.");
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {

    use super::*;

    #[test]
    fn toggle_pause() {
        let mut contract = IdentityLinker::default();
        let initial = contract.paused;
        contract.toggle_pause();
        assert_ne!(initial, contract.paused);
    }
}
