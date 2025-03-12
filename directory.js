import express from "express";
import { send } from "./utils.js";
import { urlServer } from "./config.js";
const router = express.Router();

const phone_book = [
  { name: "John", phone: "+44012345678" },
  { name: "Mary", phone: "+44112223321" },
  { name: "Tom", phone: "+4401321" },
];

router.get("/Cisco/PhoneBook", (req, res) => {
  const xml = `
    <CiscoIPPhoneInput>
      <Title>Phone Directory</Title>
      <Prompt>Enter name to search</Prompt>
      <URL>${urlServer}/Cisco/PhoneBook/Search</URL>
      <InputItem>
        <DisplayName>Name</DisplayName>
        <QueryStringParam>name</QueryStringParam>
        <InputFlags>A</InputFlags>
      </InputItem>
    </CiscoIPPhoneInput>`;

  return send(xml, res);
});

router.get("/Cisco/PhoneBook/Search", (req, res) => {
  try {
    const searchName = req.query.name?.toLowerCase() || "";

    const results = phone_book.filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchName) ||
        entry.phone.includes(searchName),
    );

    if (results.length === 0) {
      const xml = `
        <CiscoIPPhoneText>
          <Title>No Results</Title>
          <Text>No matching contacts found</Text>
        </CiscoIPPhoneText>`;

      return send(xml, res);
    }

    // Limit results to avoid overflow
    const limitedResults = results.slice(0, 32);

    const xml = `
      <CiscoIPPhoneDirectory>
        <Title>Phone Directory</Title>
        <Prompt>Select to call</Prompt>
        ${limitedResults
          .map(
            (entry) => `
          <DirectoryEntry>
            <Name>${entry.name}</Name>
            <Telephone>${entry.phone}</Telephone>
          </DirectoryEntry>
        `,
          )
          .join("")}
      </CiscoIPPhoneDirectory>`;

    return send(xml, res);
  } catch (error) {
    console.error("Error in phone directory search:", error);
    const errorXml = `
      <CiscoIPPhoneText>
        <Title>Error</Title>
        <Text>There was an error searching the directory.</Text>
      </CiscoIPPhoneText>`;

    return send(errorXml, res);
  }
});

export default router;
