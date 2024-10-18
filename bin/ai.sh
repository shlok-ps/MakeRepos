#!/usr/bin/bash
POSITIONAL_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    -i|--input)
      INPUT="$2"
      shift # past argument
      shift # past value
      ;;
    -c|--csvpath)
      CSVPATH="$2"
      shift # past argument
      shift # past value
      ;;
     -o|--output)
      OUTPUT="$2"
      shift # past argumemnt
      shift # past value
      ;;
    --default)
      DEFAULT=YES
      shift # past argument
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

set -- "${POSITIONAL_ARGS[@]}" # restore positional parameters






executionId=`/media/shlok/data/code/AI/MakeRepos/createRepo.js $CSVPATH $INPUT`  
/media/shlok/data/code/AI/MakeRepos/makeRepoFromAPIResponse.js $executionId $OUTPUT
echo "Wrote Output to Directory"
