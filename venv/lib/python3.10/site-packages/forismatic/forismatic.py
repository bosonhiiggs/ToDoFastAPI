import requests, json

class ForismaticPy:
    def get_Quote(self, language='en'):
        params = {
            'method':'getQuote',
            'lang':language, # Languages supported: Russian(ru), English(en)
            'format':'json'
        }
        try:
            res = requests.get('http://api.forismatic.com/api/1.0/', params)
            jsonText = json.loads(res.text)
            return jsonText["quoteText"], jsonText["quoteAuthor"]
        except ValueError as ex:
            return "Unsupported Language. Languages supported: Russian(ru), English(en)"