@app.route('/generate', methods=['POST'])
def generate_comparison_file():
    """Endpoint to generate a comparison file."""
    data = request.json
    if 'cells' not in data:
        return {"error": "Invalid input, 'cells' key not found."}, 400

    cells = data['cells']
    # print(cells)
    output_file = create_word_document(cells)

    # Return the file as a download
    return send_file(output_file, as_attachment=True)