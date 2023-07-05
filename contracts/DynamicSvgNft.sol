// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private i_lowImgUri;
    string private i_highImgUri;

    constructor(
        string memory lowSvg,
        string memory highImgUri
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }

    function svgToImageURI(
        string memory svg
    ) public pure returns (string memory) {
        // example:
        // '<svg width="500" height="500" viewBox="0 0 285 350" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="black" d="M150,0,L75,200,L225,200,Z"></path></svg>'
        // would return ""
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
    }
}
