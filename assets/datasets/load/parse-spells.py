import os 
import re
import json

def getSpellData(spellName, mastery, spellDescr, isHigh, school):
    spellData = dict()
    spellData["name"] = spellName
    spellData["data.high"] = isHigh
    spellData["data.mastery"] = len(mastery) > 0
    spellData["data.school"] = school
    spellData["data.description"] = spellDescr
    return spellData

dir_path = os.path.dirname(os.path.realpath(__file__))
file = open(dir_path + '/parse-spells.txt')
rawText = file.read()
file.close()

# split by schools
schools = rawText.split("\n\n")
data = dict()
for schoolText in schools:
    name = schoolText.split('\n', 1)[0]
    print("########")
    print(name)
    # print("----")
    # print(schoolText)
    identifier = re.sub('[^a-zA-Z]+', '-', name.lower())
    closeText = re.search("Close spells\.\s*(\n.+)\nHigh spells\.", schoolText, re.S|re.I).group(1)
    highText = re.search("\nHigh spells\.\s*(\n.+)", schoolText, re.S|re.I).group(1)

    closeText += "\n"
    highText += "\n"

    # print(closeText)
    # print(highText)

    data[identifier] = []
    closeSpellsMatch = re.findall("\n([^\.\(0-9]{4,20})( \(M\))?\. (.+?)(?:(?=\n[^\.0-9]{4,20}\.)|(?=\n$))", closeText, re.S|re.I)
    for (spellName, mastery, spellDescr) in closeSpellsMatch:
        data[identifier].append(getSpellData(spellName, mastery, spellDescr, False, identifier))
    
    highSpellsMatch = re.findall("\n([^\.\(0-9]{4,20})( \(M\))?\. (.+?)(?:(?=\n[^\.0-9]{4,20}\.)|(?=\n$))", highText, re.S|re.I)
    for (spellName, mastery, spellDescr) in highSpellsMatch:
        data[identifier].append(getSpellData(spellName, mastery, spellDescr, True, identifier))

    # break

print(json.dumps(data, indent=4))

filepath = dir_path + '/load_spells.json'
if os.path.exists(filepath):
    os.remove(filepath)

with open(filepath, 'w') as f:
    json.dump(data, f)