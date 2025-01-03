import React, { useState, createContext, useContext } from 'react';
import { AppRegistry, Text, TextInput, TouchableOpacity, View, ScrollView, Modal, Button } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

const CellsContext = createContext();

const CellsProvider = ({ children }) => {
  const [cells, setCells] = useState([
    { id: 1, inputs: { prompt: '', result: '', review: '' } },
  ]);

  return (
    <CellsContext.Provider value={{ cells, setCells }}>
      {children}
    </CellsContext.Provider>
  );
};

const HomeScreen = ({ navigation }) => {
  const {cells, setCells} = useContext(CellsContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState(null);

  // Handle changes in input fields
  const handleInputChange = (cellId, inputType, text) => {
    setCells(cells.map(cell => cell.id === cellId
      ? { ...cell, inputs: { ...cell.inputs, [inputType]: text } }
      : cell
    ));
  };

  // Add cell above the selected cell
  const handleAddCellAbove = (cellId) => {
    const newCell = { id: Date.now(), inputs: { prompt: '', result: '', review: '' } };
    const newCells = [...cells];
    const cellIndex = cells.findIndex((cell) => cell.id === cellId);
    newCells.splice(cellIndex, 0, newCell);
    setCells(newCells);
  };

  // Add cell below the selected cell
  const handleAddCellBelow = (cellId) => {
    const newCell = { id: Date.now(), inputs: { prompt: '', result: '', review: '' } };
    const newCells = [...cells];
    const cellIndex = cells.findIndex((cell) => cell.id === cellId);
    newCells.splice(cellIndex + 1, 0, newCell);
    setCells(newCells);
  };

  // Delete the selected cell with confirmation using window.confirm
  const handleDeleteCell = (cellId) => {
    const confirmed = window.confirm('Are you sure you want to delete this cell?');
    if (confirmed) {
      setCells(cells.filter(cell => cell.id !== cellId));
      setModalVisible(false); // Close the modal after deletion
    }
  };

  // Open the modal for a specific cell
  const handleMenuOpen = (cellId) => {
    setSelectedCellId(cellId);
    setModalVisible(true);
  };

  // Save cells as JSON and download
  const handleSaveAsJSON = () => {
    const jsonData = JSON.stringify({ cells });
    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cells.json';
    link.click();
  };

  // Upload and parse JSON file
  const handleUploadJson = () => {
    // Create a hidden file input dynamically
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const jsonData = JSON.parse(e.target.result);
          if (jsonData.cells) {
            setCells(jsonData.cells);
            alert("JSON file uploaded successfully!");
          } else {
            alert("Invalid JSON structure. Please upload a valid file.");
          }
        };
        reader.readAsText(file);
      }
    };
    // Trigger the file input click
    fileInput.click();
  };
  

  // Render the cell UI
  const renderCell = (cell) => (
    <View key={cell.id} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
        {/* <Text>Cell ID: {cell.id}</Text> */}
        <TouchableOpacity onPress={() => handleMenuOpen(cell.id)}>
          <Text style={{ color: 'blue' }}>Options</Text>
        </TouchableOpacity>
      </View>

    {/* Cell Inputs */}
    <TextInput
      style={{
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        backgroundColor: '#dfffd6' // Pastel green
      }}
      placeholder="Prompt"
      value={cell.inputs.prompt}
      onChangeText={(text) => handleInputChange(cell.id, 'prompt', text)}
    />
    <TextInput
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        backgroundColor: '#fffbd6' // Pastel yellow
      }}
      placeholder="Result"
      multiline
      value={cell.inputs.result}
      onChangeText={(text) => handleInputChange(cell.id, 'result', text)}
    />
    <TextInput
      style={{
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        backgroundColor: '#ffd6e6' // Pastel pink
      }}
      placeholder="Review"
      multiline
      value={cell.inputs.review}
      onChangeText={(text) => handleInputChange(cell.id, 'review', text)}
    />

    </View>
  );

  return (
    <>
      <ScrollView style={{ padding: 20 }}>
        {cells.map((cell) => renderCell(cell))}

        {/* Modal for Actions */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ width: 200, padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
              <Button title="Add Above" onPress={() => { handleAddCellAbove(selectedCellId); setModalVisible(false); }} />
              <Button title="Add Below" onPress={() => { handleAddCellBelow(selectedCellId); setModalVisible(false); }} />
              <Button title="Delete" onPress={() => { handleDeleteCell(selectedCellId); }} color="red" />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

const UploadJSONScreen = ({ navigation }) => {
  const { setCells } = useContext(CellsContext);

  const handleUploadJson = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            if (jsonData.cells) {
              console.log('Uploaded Data:', jsonData.cells);
              setCells(jsonData.cells);
              alert('JSON uploaded successfully!');
            } else {
              alert('Invalid JSON format. Please upload a valid file.');
            }
          } catch {
            alert('Error parsing JSON. Please ensure the file is valid.');
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        File Format Instructions:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        The file you upload must be in the correct format. Please note:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - The file should be a JSON file generated by this web application.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - Do not modify the contents or structure of the file.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        If the file is modified, the system may not process it correctly.
      </Text>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <TouchableOpacity 
          onPress={handleUploadJson} 
          style={{
            backgroundColor: "blue",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Upload File</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DownloadJSONScreen = ({ navigation }) => {
  const { cells } = useContext(CellsContext);

  const handleSaveAsJSON = () => {
    if (cells.length === 0) {
      alert('No data available to save.');
      return;
    }

    const blob = new Blob([JSON.stringify({ cells })], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cells.json';
    link.click();
    alert('File downloaded!');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        File Format Instructions:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        To ensure the file can be used in the next session, please follow these instructions:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - The file you download must be saved as a JSON file.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - Do not modify the contents or structure of the file.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - If you modify the file, it may not work correctly when used in the future session.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Please download and save the file on your local machine if you intend to use it later.
      </Text>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <TouchableOpacity
          onPress={handleSaveAsJSON}
          style={{
            backgroundColor: "blue",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Download File</Text>
        </TouchableOpacity>
      </View>
    </View>


  );
};

const AnalyzeScreen = () => {
  const { cells } = useContext(CellsContext);

  const handleAnalyze = async () => {
    if (cells.length === 0) {
      alert("Error", "No data available to analyze.");
      return;
    }

    const apiUrl = 'https://ssukree.pythonanywhere.com/generate'; // Replace with your actual API endpoint
    const jsonData = JSON.stringify({ cells });
    console.log(jsonData)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      });
    
      if (response.ok) {
        console.log('response.ok');
        const blob = await response.blob();
        console.log('blob ok');
    
        // Generate the file name (you can change this to whatever you prefer)
        const fileName = "generated_report.docx";
    
        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // Create a URL for the blob object
        link.download = fileName; // Specify the filename for download
    
        // Append the link to the document body (required for some browsers)
        document.body.appendChild(link);
    
        // Trigger the download by simulating a click
        link.click();
    
        // Clean up the DOM by removing the link
        document.body.removeChild(link);
    
        console.log("File downloaded: " + fileName);
      } else {
        const errorText = await response.text();
        alert("API Error", `API error: ${errorText}`);
      }
    } catch (error) {
      alert("Error Failed to analyze data", `Failed to analyze data: ${error.message}`);
    }    
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        File Format Instructions:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        After you analyze the data, the output file will be automatically downloaded in the following format:
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - The output will be in a .docx format.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - Any deleted text will be displayed with a strikethrough.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        - Any added text will be highlighted in green.
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Please ensure that you review the output file carefully after the analysis.
      </Text>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <TouchableOpacity
          onPress={handleAnalyze}
          style={{
            backgroundColor: "blue",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Analyze Data</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
};

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <CellsProvider>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="TraceAI Home">
          <Drawer.Screen name="TraceAI Home" component={HomeScreen} />
          <Drawer.Screen name="Upload File" component={UploadJSONScreen} />
          <Drawer.Screen name="Save File" component={DownloadJSONScreen} />
          <Drawer.Screen name="Analyze" component={AnalyzeScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </CellsProvider>
  );
}