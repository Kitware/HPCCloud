add_python_test(projects PLUGIN hpccloud)
add_python_test(simulations PLUGIN hpccloud)
add_python_test(utility PLUGIN hpccloud)
add_python_style_test(python_static_analysis_hpccloud "${PROJECT_SOURCE_DIR}/plugins/hpccloud/server")
