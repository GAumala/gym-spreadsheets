# gym-spreadsheets

Scripts used to edit spreadsheets for managing a local gym.

## Setup

1. Create a service account that can edit your spreadsheets in 
the Google Developer Console. [Here are the steps to do that]. Save that
JSON key file as `google_credentials.json` somewhere in your computer.
 
2. Create 2 spreadsheet documents in your Google Drive, one for 
the members list and other for the reservations sheets. Share those documents
with the service account created in step 1.

3. Create a JSON file `docs.json`. Copy the IDs of both documents and 
   add them to the file like this:
   
```
{
  "timetable":"<ID>",
  "members":"<ID>"
}
```

4. Clone this repository and install modules with npm. Finally copy 
   `google_credentials.json` and `docs.json` to the root of the repo:

```
git clone https://github.com/GAumala/gym-spreadsheets
cd gym-spreadsheets
npm install
```

## Update

Pull updates with git and then install new dependencies (if any) with npm:

```
git pull origin master
npm install
```

## Usage

Run the `cli.js` file with Node.js. 

```
node cli.js --help
node cli.js members --help
node cli.js reservations --help
```
