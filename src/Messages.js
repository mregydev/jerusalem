export default {
    Base64NotFound:"base64files paramters not found in json body",
    FilesUploadProblem:`Problem in uploading files`,
    FileUploadProblem:(filename)=>`Problem in uploading file ${filename}`,
    ParsingError:(stack)=>`Error parsing form ${stack}`
}