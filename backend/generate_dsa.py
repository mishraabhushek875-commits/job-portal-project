import json

categories = ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Math & Geometry']
topics = []

for c in categories:
    qlist = []
    for i in range(1, 51):
        difficulty = ['Easy', 'Medium', 'Hard'][i % 3]
        qlist.append({
            'title': f'{c} Problem {i}',
            'difficulty': difficulty,
            'leetCodeUrl': 'https://leetcode.com/problemset/all/'
        })
    topics.append({'category': c, 'questions': qlist})

with open('src/controllers/dsaTopics.json', 'w') as f:
    json.dump(topics, f, indent=2)
