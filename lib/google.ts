import { google } from 'googleapis'

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}')
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  })
}

export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId: string
): Promise<string> {
  const auth = getAuth()
  const drive = google.drive({ version: 'v3', auth })

  const { Readable } = await import('stream')
  const stream = Readable.from(fileBuffer)

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id,webViewLink',
  })

  return response.data.webViewLink || response.data.id || ''
}

export async function getOrCreateRegistrantsFolder(): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (folderId) return folderId

  const auth = getAuth()
  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.create({
    requestBody: {
      name: 'Little Quakers Registrants',
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  })

  return res.data.id!
}

export async function getCalendarEvents(spreadsheetId: string) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Calendar!A2:F1000',
    })

    const rows = res.data.values || []
    return rows.map((row, i) => ({
      id: `event-${i}`,
      type: (row[0] || 'Other') as 'Practice' | 'Game' | 'Other' | 'Banquet',
      title: row[1] || row[0] || 'Event',
      date: row[2] || '',
      time: row[3] || '',
      location: row[4] || '',
      description: row[5] || '',
    }))
  } catch {
    return []
  }
}

export async function createRosterSheet(players: Record<string, string | number | null>[]) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `Little Quakers Roster ${new Date().getFullYear()}` },
      sheets: [{ properties: { title: 'Roster' } }],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!

  const headers = [
    'Jersey #',
    'First Name',
    'Last Name',
    'Position',
    'Height',
    'Weight',
    'Caregiver First Name',
    'Caregiver Last Name',
    'Caregiver Phone',
    'Email',
  ]

  const rows = players.map((p) => [
    p.jersey_number || '',
    p.player_first_name,
    p.player_last_name,
    p.position_desired,
    p.height,
    p.weight,
    p.caregiver_first_name,
    p.caregiver_last_name,
    p.phone,
    p.email,
  ])

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Roster!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [headers, ...rows] },
  })

  const drive = google.drive({ version: 'v3', auth })
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  const file = await drive.files.get({
    fileId: spreadsheetId,
    fields: 'webViewLink',
  })

  return file.data.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
}

export async function createCalendarSheet(): Promise<{ spreadsheetId: string; url: string }> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: `Little Quakers Calendar ${new Date().getFullYear()}` },
      sheets: [{ properties: { title: 'Calendar' } }],
    },
  })

  const spreadsheetId = spreadsheet.data.spreadsheetId!

  const headers = ['Type', 'Title', 'Date (YYYY-MM-DD)', 'Time', 'Location', 'Description']
  const example = ['Practice', 'Week 1 Practice', '2025-08-01', '6:00 PM', 'Lincoln Field, Philadelphia', 'Full pads required']

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Calendar!A1',
    valueInputOption: 'RAW',
    requestBody: { values: [headers, example] },
  })

  const drive = google.drive({ version: 'v3', auth })
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: { role: 'writer', type: 'anyone' },
  })

  const file = await drive.files.get({
    fileId: spreadsheetId,
    fields: 'webViewLink',
  })

  const url = file.data.webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
  return { spreadsheetId, url }
}
