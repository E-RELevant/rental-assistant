<p align="center">
  <img src="https://raw.githubusercontent.com/E-RELevant/rental-assistant/main/resources/icons/128.png">
</p>

# Rental Assistant (Apartment Search Assistant)

Streamline your apartment search with the help of my automated WhatsApp messaging tool. With just a few clicks, you can send customized messages to advertisers, making the process faster and more efficient.

## Download

- Chrome Extension: Download link `#TBD`
  - Downloading source code: [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) or [Download](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives#downloading-source-code-archives)
  - [Loading an unpacked extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked)

## Key Features

### Personalization Options

Customize the sender's name and message content according to your preferences.

### Convenient Number Selection

Easily select a contact number and send a message using the context menu for seamless integration.

### Message Tags Support

Enhance your communication with the use of message tags such as:

- `@name`: Inserts the name of the sender.
- `@greeting`: Automatically generates a personalized greeting based on the time of day _(e.g., good morning, good afternoon, good night)_.
- `@website`: Includes the source of the message's publication.

### Highlights

<table>
 <tr>
  <td width="550">
   <div align="center">
    <p>
     <img src="https://raw.githubusercontent.com/E-RELevant/rental-assistant/main/resources/img/examples/popup.png" width="300" alt="popup window">
    </p>
    <p>
     <sup>Popup window</sup>
    </p>
     </div>
  </td>
 </tr>
</table>
<table>
 <tr>
  <td width="550">
   <div align="center">
    <p>
     <img src="https://raw.githubusercontent.com/E-RELevant/rental-assistant/main/resources/img/examples/facebook-link.png" width="300" alt="facebook links">
    </p>
    <p>
     <sup>Facebook feed links</sup>
    </p>
     </div>
  </td>
 </tr>
</table>
<table>
 <tr>
  <td width="550">
   <div align="center">
    <p>
     <img src="https://raw.githubusercontent.com/E-RELevant/rental-assistant/main/resources/img/examples/context-menu.png" width="300" alt="context menu markup">
    </p>
    <p>
     <sup>Context menu option</sup>
    </p>
     </div>
  </td>
 </tr>
</table>

## Ideas

- [x] Themes (light/dark)
- [ ] Localization
  - [x] Select language
  - [x] Select international country calling code
  - [ ] Depending on the international calling code template, trim phone prefixes
- [ ] Detect dynamically added phone numbers
- [ ] Toggle activation on/off
- [x] Options: Snackbar / Toast indication on options change
- [ ] Message content: encoded-emoji support
- [ ] Data persistence: reload page only when matching one of the manifest's content_scripts matches
- [ ] Multiple saved messages
- [ ] Tags
  - [x] Highlight tags
  - [ ] `@publisher`: Inserts the name of the publisher
  - [ ] `@address`: Inserts the apartment's address

## Feedback

If you encounter any issues with the extension or have suggestions for improving its functionality, please feel free to create an issue [here](https://github.com/erel-adoni/apartment-search-assistant/issues). If you possess coding expertise, you can also fork the repository, make the necessary changes, and submit a pull request.

## License

This project is licensed under the [MIT License](https://en.wikipedia.org/wiki/MIT_License). For more details, refer to the [LICENSE.md](LICENSE.md) file.
