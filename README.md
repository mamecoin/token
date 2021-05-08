# mameCoin smart contract

###### Returns true if the caller is the current owner.
function isOwner() public view returns (bool)

###### Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner.
function renounceOwnership() public onlyOwner

###### Transfers ownership of the contract to a new account (`newOwner`).
function transferOwnership(address newOwner) public onlyOwner;

###### Total number of tokens in existence.
function totalSupply() public view returns (uint256);

###### Gets the balance of the specified address.
function balanceOf(address account) public view returns (uint256);

###### Transfer token for a specified address.
function transfer(address recipient, uint256 amount) public returns (bool);

###### Function to check the amount of tokens that an owner allowed to a spender.
function allowance(address owner, address spender) public view returns (uint256);

###### Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
function approve(address spender, uint256 amount) public returns (bool);

###### Transfer tokens from one address to another.
function transferFrom(address sender, address recipient, uint256 amount) public returns (bool);

###### Atomically increases the allowance granted to `spender` by the caller.
function increaseAllowance(address spender, uint256 addedValue) public returns (bool);

###### Atomically decreases the allowance granted to `spender` by the caller.
function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool);

###### Creates `amount` tokens and assigns them to `account`, increasing the total supply.
function mint(address account, uint256 amount) public onlyOwner;

###### Destroys `amount` tokens from `account`, reducing the total supply.
function burn(address account, uint256 amount) public onlyOwner;

###### Airdrop tokens for specific addresses.
function airdrop(address[] memory accounts, uint256 amount) public returns (bool);

###### distribute tokens for a specified addresses.
function distribute(address[] memory accounts, uint256[] memory amounts) public returns (bool);
