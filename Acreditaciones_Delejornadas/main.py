import sys

from funciones import gen_acreditacion, get_excel_data


def main():
    if len(sys.argv) < 3:
        input_file = input("Introduce excel file path: ")
        output_file = input("Introduce output file path: ")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
    data = get_excel_data(input_file)
    f_output = output_file
    for i in data:
        print(i)
        gen_acreditacion(i, f_output)


if __name__ == "__main__":
    main()
