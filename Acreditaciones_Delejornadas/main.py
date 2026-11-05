import os
import sys
from concurrent.futures import ThreadPoolExecutor

from funciones import gen_acreditacion, get_excel_data, make_pdf


def main():
    if len(sys.argv) < 3:
        input_file = input("Introduce excel file path: ")
        output_file = input("Introduce output file path: ")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
    data = get_excel_data(input_file)
    f_output = output_file
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(gen_acreditacion, row, f_output) for row in data]
        for row, future in zip(data, futures):
            print(row)
            future.result()
    make_pdf(f_output, os.path.join(f_output, "acreditaciones.pdf"))


if __name__ == "__main__":
    main()
