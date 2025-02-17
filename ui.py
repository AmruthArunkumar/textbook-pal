import streamlit as st
import google.generativeai as genai
from llama_parse import LlamaParse
from llama_index.core import SimpleDirectoryReader
from TempFile import TempFile
from dotenv import load_dotenv
import json
import os
import re

# nltk.download('punkt')
# nltk.download('punkt_tab')

load_dotenv()

LLAMA_PARSE_API_KEY = st.secrets["LLAMA_PARSE_KEY"]
GEMINI_API_KEY = st.secrets["GEMINI_API_KEY"]
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

parser = LlamaParse(
    result_type="markdown",
    api_key=LLAMA_PARSE_API_KEY
)

file_extractor = {".pdf": parser}

st.title("Textbook Pal")
topic = st.text_input("What is the topic")
objectives = st.text_area("What are the learning objectives (Recommended)")
# folder = st.text_input("File prefix (Folder)?")
content = st.file_uploader("Choose a file", type=(["pdf"]))

btnOverview = st.button("Generate Overview")
btnKeyTerms = st.button("Generate Key Terms")
btnQuestions = st.button("Generate Questions")

if btnOverview and content is not None:
    path_in = content.name
    # if folder:
    #     path_in = folder + "/" + path_in
    print(path_in)

    with open("parsed.json", "r") as f:
        data = json.load(f)

    if path_in not in data:
        with TempFile(content.name, content.getvalue()) as path_in:
            print(path_in)
            documents = SimpleDirectoryReader(input_files=[path_in], file_extractor=file_extractor).load_data()
        content = ""
        for doc in documents:
            content += doc.text
        print("Done LlamaParse Processing")
        data[path_in] = content
        json_obj = json.dumps(data, indent=4)
        with open("parsed.json", "w") as f:
            f.write(json_obj)
    else:
        content = data[path_in]
        print("Skipped LlamaParse. Retrieved from History")

    if not objectives:
        objectives = "N/A"
    with open("preprompt_overview.txt", "r", encoding="utf-8") as f:
        preprompt = f.read()

    prompt = (
        f'{preprompt}\n' +
        f'topic: {topic}\n' +
        f'learning objectives: {objectives}\n' +
        f'content: {content}\n'
    )
    
    response = model.generate_content(prompt)

    tables = re.findall(r'\[LATEX START\](.*?)\[LATEX END\]', response.text, re.DOTALL)
    text = re.findall(r'\[LATEX END\](.*?)\[LATEX START\]', response.text, re.DOTALL)
    print(tables)
    if tables:
        st.markdown((response.text.split("[LATEX START]")[0]).strip(" \r\n"))
        for pair in zip(tables, text):
            st.latex(pair[0].strip(" \r\n"))
            st.markdown(pair[1].strip(" \r\n"))
        if len(tables) - len(text) != 0:
            st.latex(tables[-1].strip(" \r\n"))
        st.markdown((response.text.split("[LATEX END]")[-1]).strip(" \r\n"))
    else:
        st.markdown(response.text)
elif btnQuestions and content is not None:
    path_in = content.name
    # if folder:
    #     path_in = folder + "/" + path_in
    print(path_in)
    
    with open("parsed.json", "r") as f:
        data = json.load(f)

    if path_in not in data:
        with TempFile(content.name, content.getvalue()) as path_in:
            documents = SimpleDirectoryReader(input_files=[path_in], file_extractor=file_extractor).load_data()
        content = ""
        for doc in documents:
            content += doc.text
        print("Done LlamaParse Processing")
        data[path_in] = content
        json_obj = json.dumps(data, indent=4)
        with open("parsed.json", "w") as f:
            f.write(json_obj)
    else:
        content = data[path_in]
        print("Skipped LlamaParse. Retrieved from History")

    if not objectives:
        objectives = "N/A"
    with open("preprompt_question.txt", "r", encoding="utf-8") as f:
        preprompt = f.read()

    prompt = (
        f'{preprompt}\n' +
        f'topic: {topic}\n' +
        f'learning objectives: {objectives}\n' +
        f'content: {content}\n'
    )
    
    response = model.generate_content(prompt)
    
    questions = re.findall(r'\[QUESTION START\](.*?)\[QUESTION END\]', response.text, re.DOTALL)
    text = re.findall(r'\[QUESTION END\](.*?)\[QUESTION START\]', response.text, re.DOTALL)
    answerKey = ""
    if questions:
        qnum = 1
        st.markdown((response.text.split("[QUESTION START]")[0]).strip(" \r\n"))
        for pair in zip(questions, text):
            q = pair[0].split("A)")[0].strip(" \r\n")
            a = pair[0].split("A)")[1].split("B)")[0].strip(" \r\n")
            b = pair[0].split("B)")[1].split("C)")[0].strip(" \r\n")
            c = pair[0].split("C)")[1].split("D)")[0].strip(" \r\n")
            d = pair[0].split("D)")[1].split("Correct Answer)")[0].strip(" \r\n")
            ans = pair[0].split("Correct Answer)")[1].split("Explanation)")[0].strip(" \r\n")
            exp = pair[0].split("Explanation)")[1].strip(" \r\n")

            st.markdown(f"### Q{str(qnum)}: {q}")
            st.markdown(
                f"A) {a}\n\n" +
                f"B) {b}\n\n" +
                f"C) {c}\n\n" +
                f"D) {d}"
            )
            with st.expander("Show Answer"):
                st.markdown(
                    f"Q{str(qnum)}: {ans}\n\n" + 
                    f"Explanation: {exp}"
                )
            
            st.markdown("## " + pair[1].strip("# \r\n"))
            qnum += 1
        if len(questions) - len(text) != 0:
            q = questions[-1].split("A)")[0].strip(" \r\n")
            b = questions[-1].split("B)")[1].split("C)")[0].strip(" \r\n")
            a = questions[-1].split("A)")[1].split("B)")[0].strip(" \r\n")
            c = questions[-1].split("C)")[1].split("D)")[0].strip(" \r\n")
            d = questions[-1].split("D)")[1].split("Correct Answer)")[0].strip(" \r\n")
            ans = questions[-1].split("Correct Answer)")[1].split("Explanation)")[0].strip(" \r\n")
            exp = questions[-1].split("Explanation)")[1].strip(" \r\n")

            st.markdown(f"### Q{str(qnum)}: {q}")
            st.markdown(
                f"A) {a}\n\n" +
                f"B) {b}\n\n" +
                f"C) {c}\n\n" +
                f"D) {d}"
            )
            with st.expander("Show Answer"):
                st.markdown(
                    f"Q{str(qnum)}: {ans}\n\n" + 
                    f"Explanation: {exp}"
                )
        st.markdown((response.text.split("[QUESTION END]")[-1]).strip(" \r\n"))
    else:
        st.markdown(response.text)
elif btnKeyTerms and content is not None:
    path_in = content.name
    # if folder:
    #     path_in = folder + "/" + path_in
    print(path_in)

    with open("parsed.json", "r") as f:
        data = json.load(f)

    if path_in not in data:
        with TempFile(content.name, content.getvalue()) as path_in:
            print(path_in)
            documents = SimpleDirectoryReader(input_files=[path_in], file_extractor=file_extractor).load_data()
        content = ""
        for doc in documents:
            content += doc.text
        print("Done LlamaParse Processing")
        data[path_in] = content
        json_obj = json.dumps(data, indent=4)
        with open("parsed.json", "w") as f:
            f.write(json_obj)
    else:
        content = data[path_in]
        print("Skipped LlamaParse. Retrieved from History")

    if not objectives:
        objectives = "N/A"
    with open("preprompt_keyterms.txt", "r", encoding="utf-8") as f:
        preprompt = f.read()

    prompt = (
        f'{preprompt}\n' +
        f'topic: {topic}\n' +
        f'learning objectives: {objectives}\n' +
        f'content: {content}\n'
    )
    
    response = model.generate_content(prompt)
    st.markdown(response.text)
    
else:
    path_in = None
