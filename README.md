# mameCoin smart contract

###### Allows the current owner to transfer control of the contract to a newOwner.
function transferOwnership(address newOwner) public onlyOwner;

###### Total number of tokens in existence.
function totalSupply() public view returns (uint256);

###### Gets the balance of the specified address.
function balanceOf(address _owner) public view returns (uint256);

###### Transfer token for a specified address.
function transfer(address _to, uint256 _amount) public returns (bool);

###### Transfer tokens from one address to another.
function transferFrom(address _from, address _to, uint256 _amount) public returns (bool);

###### Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
function approve(address _spender, uint256 _amount) public returns (bool);

###### Function to check the amount of tokens that an owner allowed to a spender.
function allowance(address _owner, address _spender) public view returns (uint256);

###### Burns a specific amount of tokens.
function burn(address _to, uint256 _amount) public onlyOwner;

###### Refund a specific amount of tokens.
function refund(address _to, uint256 _amount) public onlyOwner;

###### Gets the lockuptime of the specified address.
function lockupOf(address _owner) public view returns (uint256);

###### Lockup a specific address until given time.
function lockup(address _to, uint256 _lockupTimeUntil) public onlyOwner;

###### Airdrop tokens for a specified addresses.
function airdrop(address[] _receivers, uint256 _amount) public returns (bool);

###### Distribute tokens for a specified addresses.
function distribute(address[] _receivers, uint256[] _amounts) public returns (bool);
