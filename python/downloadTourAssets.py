import argparse
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen

LOCAL_PREFIX = "/downloaded/"

# python3 downloadTourAssets.py ./tour.data.json ../output/tour-data-1 --concurrency 10


def is_asset_url(value):
    if not isinstance(value, str):
        return False
    value = value.strip()
    if not value.startswith(("http://", "https://")):
        return False
    if value.startswith(LOCAL_PREFIX):
        return False
    return bool(urlparse(value).path.strip("/"))


def relative_path_from_url(url):
    parsed = urlparse(url)
    return unquote(parsed.path.lstrip("/"))


def collect_asset_urls(data):
    urls = set()

    def walk(node):
        if isinstance(node, dict):
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)
        elif is_asset_url(node):
            urls.add(node.strip())

    walk(data)
    return urls


def rewrite_urls(data, url_map):
    if isinstance(data, dict):
        return {key: rewrite_urls(value, url_map) for key, value in data.items()}
    if isinstance(data, list):
        return [rewrite_urls(item, url_map) for item in data]
    if isinstance(data, str) and data.strip() in url_map:
        return url_map[data.strip()]
    return data


def download_file(url, dest_path, timeout=60):
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    if dest_path.exists() and dest_path.stat().st_size > 0:
        return

    request = Request(url, headers={"User-Agent": "downloadTourAssets/1.0"})
    with urlopen(request, timeout=timeout) as response:
        dest_path.write_bytes(response.read())


def download_asset(url, dest_path, timeout=60):
    relative_path = relative_path_from_url(url)
    try:
        if dest_path.exists() and dest_path.stat().st_size > 0:
            return "skipped", relative_path, None
        download_file(url, dest_path, timeout=timeout)
        return "downloaded", relative_path, None
    except (HTTPError, URLError, OSError) as error:
        return "failed", relative_path, str(error)


def download_tour_assets(input_path, output_dir, timeout=60, concurrency=5):
    input_path = Path(input_path).resolve()
    output_dir = Path(output_dir).resolve()

    if not input_path.is_file():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    with input_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    asset_urls = sorted(collect_asset_urls(data))
    if not asset_urls:
        print("No asset URLs found.")
        return data

    url_map = {}
    tasks = []
    for url in asset_urls:
        relative_path = relative_path_from_url(url)
        url_map[url] = f"{LOCAL_PREFIX}{relative_path}"
        tasks.append((url, output_dir / relative_path))

    downloaded = 0
    skipped = 0
    failed = []
    total = len(tasks)

    print(f"Found {total} asset URL(s), concurrency={concurrency}.")

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        future_to_task = {
            executor.submit(download_asset, url, dest_path, timeout): (index, url)
            for index, (url, dest_path) in enumerate(tasks, start=1)
        }

        for future in as_completed(future_to_task):
            index, url = future_to_task[future]
            status, relative_path, error = future.result()

            if status == "skipped":
                skipped += 1
                print(f"[{index}/{total}] skip existing {relative_path}")
            elif status == "downloaded":
                downloaded += 1
                print(f"[{index}/{total}] downloaded {relative_path}")
            else:
                failed.append((url, error))
                print(f"[{index}/{total}] failed {relative_path}: {error}", file=sys.stderr)

    updated_data = rewrite_urls(data, url_map)
    output_json_path = output_dir / input_path.name
    output_dir.mkdir(parents=True, exist_ok=True)
    with output_json_path.open("w", encoding="utf-8") as handle:
        json.dump(updated_data, handle, indent=4, ensure_ascii=False)
        handle.write("\n")

    print(
        f"Done. downloaded={downloaded}, skipped={skipped}, failed={len(failed)}, "
        f"json={output_json_path}"
    )

    if failed:
        raise RuntimeError(f"{len(failed)} download(s) failed.")

    return updated_data


def parse_args(argv=None):
    parser = argparse.ArgumentParser(
        description="Download tour asset URLs from a JSON file and rewrite them to /downloaded/ paths."
    )
    parser.add_argument("input_file", help="Path to the tour JSON file, e.g. ./tour.data.json")
    parser.add_argument("output_dir", help="Directory to store downloaded assets and updated JSON")
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="Download timeout in seconds (default: 60)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=5,
        help="Number of concurrent downloads (default: 5)",
    )
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    try:
        if args.concurrency < 1:
            raise ValueError("concurrency must be at least 1")
        download_tour_assets(
            args.input_file,
            args.output_dir,
            timeout=args.timeout,
            concurrency=args.concurrency,
        )
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
