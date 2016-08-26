{% if cluster.type == 'ec2' -%}
#$ -q all.q@@master
{% endif -%}


# Set up cluster-specific variables
PARAVIEW_DIR={{paraviewInstallDir if paraviewInstallDir else "/opt/paraview/install"}}
PV_BATCH="${PARAVIEW_DIR}/bin/pvbatch"
LIB_VERSION_DIR=`ls ${PARAVIEW_DIR}/lib | grep paraview`
APPS_DIR="lib/${LIB_VERSION_DIR}/site-packages/paraview/web"
VISUALIZER="pvw-visualizer.py"
GET_PORT_PYTHON_CMD='import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()'
RC_PORT=`python -c "${GET_PORT_PYTHON_CMD}"`
echo ${RC_PORT} > /tmp/{{job._id}}.rc_port

# Run in MPI mode
MPIPROG="mpiexec"

# Need to adjust paths for Mac application install
case $PARAVIEW_DIR in
    *paraview.app)
        PV_BATCH="${PARAVIEW_DIR}/Contents/bin/pvbatch"
        MPIPROG="${PARAVIEW_DIR}/Contents/MacOS/mpiexec"
        ;;
esac

REVERSE="--reverse-connect-port ${RC_PORT}"

PROXIES="config/defaultProxies.json"
JOB_OUTPUT_DIR="{{ cluster.config.jobOutputDir if cluster.config.jobOutputDir else '$HOME'}}"

# Get the ip of this host
IPADDRESS={{ cluster.config.host }}

if [ -z "$IPADDRESS" ]; then
IPADDRESS=`hostname`
fi

WEBSOCKET_PORT={{ cluster.config.paraview.websocketPort }}

{% if cluster.type == 'trad' -%}
WEBSOCKET_PORT=`python -c "${GET_PORT_PYTHON_CMD}"`
# Create proxy entry
KEY="{{ sessionKey }}"
BODY='{"host": "'$IPADDRESS'", "port": '${WEBSOCKET_PORT}', "key": "'$KEY'"}'
curl --silent --show-error -o /dev/null -X POST -d "$BODY"  --header "Content-Type: application/json" {{ baseUrl }}/proxy
{% endif -%}

LD_LIBRARY_PATH=${PARAVIEW_DIR}/lib/${LIB_VERSION_DIR}
export LD_LIBRARY_PATH
DISPLAY=:0
export DISPLAY

# First run pvbatch
${MPIPROG} -n 2 ${PV_BATCH} {{'--mesa-llvm' if not gpu else ''}} ${VISUALIZER} --timeout 3600 --host $IPADDRESS --port ${WEBSOCKET_PORT} \
{{ '--data-dir %s' % dataDir if dataDir else ''}} \
{{ '--load-file %s' % fileName if fileName else '' }}

{% if cluster.type == 'trad' -%}
# Remove proxy entry
curl --silent --show-error -o /dev/null -X DELETE "{{ baseUrl }}/proxy/${KEY}"
{% endif -%}
