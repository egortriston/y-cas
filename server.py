from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class LocalServer(ThreadingHTTPServer):
    allow_reuse_address = True


PORT = 4173

with LocalServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler) as httpd:
    print(f"SERVING:{PORT}", flush=True)
    httpd.serve_forever()
